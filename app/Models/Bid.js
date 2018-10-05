'use strict'

const Model = use('Model')

class Bid extends Model {
  user () {
    return this.belongsTo('App/Models/User')
  }

  lot () {
    return this.belongsTo('App/Models/Lot')
  }

  order () {
    return this.hasOne('App/Models/Order')
  }

  static getCurrentLotList (lotId, page, perPage) {
    return this.query().where('lot_id', lotId)
      .orderBy('created_at', 'desc')
      .paginate(page, perPage)
  }
}

module.exports = Bid
