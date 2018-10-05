'use strict'

// eslint-disable-next-line no-undef
const Schema = use('Schema')

class UserSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('email', 254).notNullable().unique()
      table.string('phone', 20).notNullable().unique()
      table.string('firstName', 20).notNullable()
      table.string('lastName', 20).notNullable()
      table.string('password', 60).notNullable()
      table.string('confirmationToken', 40)
      table.string('restorePasswordToken', 40)
      table.boolean('confirmed').defaultTo(false)
      table.date('dob').notNullable()
      table.timestamps()
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UserSchema
