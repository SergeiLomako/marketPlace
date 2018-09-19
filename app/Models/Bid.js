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
}

module.exports = Bid
