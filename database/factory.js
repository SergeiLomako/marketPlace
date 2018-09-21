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
const Hash = use('Hash')

function randomInt (min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1)
  rand = Math.round(rand)
  return rand
}

function addDays (date, daysCount) {
  date.setDate(date.getDate() + daysCount)
  const year = date.getFullYear()
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  const days = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  const hours = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  const seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
  return `${year}-${month}-${days} ${hours}:${minutes}:${seconds}`
}

Factory.blueprint('App/Models/User', async (faker) => {
  return {
    firstname: faker.first(),
    lastname: faker.last(),
    email: faker.email({ domain: 'test.com' }),
    phone: faker.phone({ formatted: false }),
    password: await Hash.make(faker.password()),
    confirmationToken: faker.string({ length: 40 }),
    dob: faker.birthday({ type: 'adult' })
  }
})

Factory.blueprint('App/Models/Lot', async (faker) => {
  return {
    'user_id': randomInt(1, 5),
    title: faker.paragraph({ sentences: 1 }),
    currentPrice: faker.integer({ min: randomInt(10, 50), max: randomInt(50, 70) }),
    estimatedPrice: faker.integer({ min: randomInt(80, 90), max: randomInt(120, 200) }),
    startTime: addDays(new Date(), 1),
    endTime: addDays(new Date(), 2)
  }
})
