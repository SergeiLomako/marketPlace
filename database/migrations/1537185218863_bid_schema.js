'use strict'

const Schema = use('Schema')

class BidSchema extends Schema {
  up () {
    this.create('bids', (table) => {
      table.increments()
      table.integer('user_id').unsigned().notNullable()
      table.integer('lot_id').unsigned().notNullable()
      table.foreign('user_id').references('id').inTable('users').onDelete('RESTRICT')
      table.foreign('lot_id').references('id').inTable('lots').onDelete('CASCADE')
      table.integer('proposedPrice').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('bids')
  }
}

module.exports = BidSchema
