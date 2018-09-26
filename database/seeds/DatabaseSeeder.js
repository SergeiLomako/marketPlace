'use strict'

/*
|--------------------------------------------------------------------------
| DatabaseSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')

class DatabaseSeeder {
  async run () {
    await Factory
      .model('App/Models/User')
      .createMany(5)

    await Factory
      .model('App/Models/Lot')
      .createMany(10)

    await Factory
      .model('App/Models/Bid')
      .createMany(10)
  }
}

module.exports = DatabaseSeeder
