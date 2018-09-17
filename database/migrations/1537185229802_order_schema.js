'use strict'

const Schema = use('Schema')

class OrderSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.increments()
      table.integer('bidId').unsigned().references('id').inTable('bids')
      table.string('status').notNullable()
      table.string('type').notNullable()
      table.string('arrivalLocation').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('orders')
  }
}

module.exports = OrderSchema
