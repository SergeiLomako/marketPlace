'use strict'

const Model = use('Model')
const Env = use('Env')

class Lot extends Model {
  bids () {
    return this.hasMany('App/Models/Bid')
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
