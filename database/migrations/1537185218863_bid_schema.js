'use strict'

const Schema = use('Schema')

class BidSchema extends Schema {
  up () {
    this.create('bids', (table) => {
      table.increments()
      table.integer('userId').unsigned().references('id').inTable('users')
      table.integer('lotId').unsigned().references('id').inTable('lots')
      table.integer('proposedPrice').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('bids')
  }
}

module.exports = BidSchema
