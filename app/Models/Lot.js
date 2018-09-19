'use strict'

const Model = use('Model')

class Lot extends Model {
  bids () {
    return this.hasMany('App/Models/Bid')
  }
}

module.exports = Lot
