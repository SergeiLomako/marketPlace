'use strict'

const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('email', 254).notNullable().unique()
      table.string('phone', 20).notNullable().unique()
      table.string('firstname', 20).notNullable()
      table.string('lastname', 20).notNullable()
      table.string('password', 60).notNullable()
      table.timestamp('dob').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
