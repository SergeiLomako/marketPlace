'use strict'

const Schema = use('Schema')

class OrderSchema extends Schema {
  up () {
    this.create('orders', (table) => {
      table.increments()
      table.integer('bid_id').unsigned().notNullable()
      table.foreign('bid_id').references('id').inTable('bids').onDelete('CASCADE')
      table.string('status').defaultTo('pending')
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
