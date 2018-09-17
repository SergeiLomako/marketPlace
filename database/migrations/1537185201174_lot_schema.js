'use strict'

const Schema = use('Schema')

class LotSchema extends Schema {
  up () {
    this.create('lots', (table) => {
      table.increments()
      table.integer('userId').unsigned().references('id').inTable('users')
      table.string('status').notNullable()
      table.string('title').notNullable()
      table.string('image').notNullable()
      table.text('description').notNullable()
      table.integer('currentPrice').notNullable()
      table.integer('estimatedPrice').notNullable()
      table.timestamp('startTime').notNullable()
      table.timestamp('endTime').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('lots')
  }
}

module.exports = LotSchema
