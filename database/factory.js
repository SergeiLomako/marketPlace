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
const orderStatuses = ['pending', 'sent', 'delivered']
const orderTypes = [
  'pickup', 'Royal Mail', 'DHL Express',
  'United States Postal Service'
]
function randomInt (min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  rand = Math.round(rand)
  return rand
}

Factory.blueprint('App/Models/User', async (faker, i, data) => {
  return {
    firstName: faker.first(),
    lastName: faker.last(),
    restorePasswordToken: data.restoreToken || null,
    email: data.email || `${randomInt(100, 10000)}${faker.email({ domain: 'test.com' })}`,
    phone: faker.phone({ formatted: false }),
    password: 'qwerty',
    confirmed: data.confirmed || false,
    confirmationToken: data.confirmationToken || faker.string({ length: 40 }),
    dob: faker.birthday({ type: 'adult' })
  }
})

Factory.blueprint('App/Models/Lot', async (faker, i, data) => {
  return {
    'user_id': data.userId || 2,
    title: data.title || faker.paragraph({ sentences: 1 }),
    status: data.status || statuses[randomInt(0, 1)],
    currentPrice: data.currentPrice || faker.integer({ min: randomInt(10, 50), max: randomInt(50, 70) }),
    estimatedPrice: data.estimatedPrice || faker.integer({ min: randomInt(80, 90), max: randomInt(120, 200) }),
    startTime: data.startTime || Moment().add(1, 'days').toISOString(),
    endTime: data.endTime || Moment().add(2, 'days').toISOString()
  }
})

Factory.blueprint('App/Models/Bid', async (faker, i, data) => {
  return {
    'user_id': data.userId || 3,
    'lot_id': data.lotId || 1,
    proposedPrice: data.proposedPrice || randomInt(50, 80)
  }
})

Factory.blueprint('App/Models/Order', async (faker, i, data) => {
  return {
    'bid_id': data.bidId || randomInt(1, 5),
    status: data.status || orderStatuses[randomInt(0, 2)],
    type: data.type || orderTypes[randomInt(0, 3)],
    arrivalLocation: faker.paragraph({ sentences: 1 })
  }
})
