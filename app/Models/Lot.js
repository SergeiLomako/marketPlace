'use strict'

const Model = use('Model')
const Env = use('Env')
const { addJob, removeJob } = use('App/Helpers/jobs')

class Lot extends Model {
  static boot () {
    super.boot()

    this.addHook('afterCreate', async (lot) => {
      lot.inProcessJobId = await addJob('inProcess', { lotId: lot.id }, lot.startTime)
      lot.closedJobId = await addJob('closed', { lotId: lot.id }, lot.endTime)
      await lot.save()
    })

    this.addHook('beforeDelete', async (lot) => {
      await removeJob(lot.inProcessJobId)
      await removeJob(lot.closedJobId)
    })
  }

  static get dates () {
    return super.dates.concat(['startTime', 'endTime'])
  }

  static castDates (field, value) {
    if (field === 'startTime' || field === 'endTime') {
      return value.format('DD.MM.YYYY HH:mm')
    }
  }

  bids () {
    return this.hasMany('App/Models/Bid')
      .orderBy('created_at', 'desc')
  }

  user () {
    return this.belongsTo('App/Models/User')
  }

  static getAll (page) {
    return this.query().where('status', 'inProcess').paginate(page, Env.get('PAGINATE'))
  }

  static getUserLotsWithBids (userId, page) {
    return this.query().where('user_id', userId)
      .orWhereHas('bids', (builder) => {
        builder.where('user_id', userId)
      })
      .paginate(page, Env.get('PAGINATE'))
  }

  static getUserOnlyCreatedLots (userId, page) {
    return this.query().where('user_id', userId).paginate(page, Env.get('PAGINATE'))
  }

  static getUserOnlyBidsLots (userId, page) {
    return this.query().whereHas('bids', (builder) => {
      builder.where('user_id', userId)
    })
      .paginate(page, Env.get('PAGINATE'))
  }

  static getList (request, userId) {
    const page = request.input('page', 1)
    if (request.input('myLots', false) && request.input('filter', false)) {
      return request.input('filter') === 'created'
        ? this.getUserOnlyCreatedLots(userId, page)
        : this.getUserOnlyBidsLots(userId, page)
    }

    return request.input('myLots', false)
      ? this.getUserLotsWithBids(userId, page)
      : this.getAll(page)
  }
}

module.exports = Lot
