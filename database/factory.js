'use strict'

/*
|--------------------------------------------------------------------------
| Factory
|--------------------------------------------------------------------------
|
| Factories are used to define blueprints for database tables or Lucid
| models. Later you can use these blueprints to seed your database
| with dummy data.
|
*/

const Factory = use('Factory')
const Moment = use('moment')
const statuses = ['pending', 'inProcess']

function randomInt (min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  rand = Math.round(rand)
  return rand
}

Factory.blueprint('App/Models/User', async (faker, i, data) => {
  return {
    firstname: faker.first(),
    lastname: faker.last(),
    restorePasswordToken: data.restoreToken || null,
    email: faker.email({ domain: 'test.com' }),
    phone: faker.phone({ formatted: false }),
    password: 'qwerty',
    confirmed: data.confirmed || false,
    confirmationToken: data.confirmationToken || faker.string({ length: 40 }),
    dob: faker.birthday({ type: 'adult' })
  }
})

Factory.blueprint('App/Models/Lot', async (faker) => {
  return {
    'user_id': randomInt(1, 5),
    title: faker.paragraph({ sentences: 1 }),
    status: statuses[randomInt(0, 1)],
    currentPrice: faker.integer({ min: randomInt(10, 50), max: randomInt(50, 70) }),
    estimatedPrice: faker.integer({ min: randomInt(80, 90), max: randomInt(120, 200) }),
    startTime: Moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss'),
    endTime: Moment().add(2, 'days').format('YYYY-MM-DD HH:mm:ss')
  }
})

Factory.blueprint('App/Models/Bid', async () => {
  return {
    'user_id': randomInt(1, 5),
    'lot_id': randomInt(1, 5),
    proposedPrice: randomInt(50, 80)
  }
})
