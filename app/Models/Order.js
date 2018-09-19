'use strict'

const Model = use('Model')

class Order extends Model {
  bid () {
    return this.belongsTo('App/Models/Bid')
  }
}

module.exports = Order
