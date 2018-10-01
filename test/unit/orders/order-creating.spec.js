'use strict'

const { test, trait, before, after } = use('Test/Suite')('Create order')
const Factory = use('Factory')
const Route = use('Route')
const Database = use('Database')
const Antl = use('Antl')
const { generateErrors } = use('App/Helpers/validation')
let user
let user1
let lot
let bid
let bid1

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
  user1 = await Factory.model('App/Models/User').create()
  lot = await Factory.model('App/Models/Lot').create({
    currentPrice: 100,
    estimatedPrice: 200,
    status: 'closed',
    'user_id': user.id
  })

  bid = await Factory.model('App/Models/Bid').create({
    proposedPrice: 140,
    lotId: lot.id,
    userId: user1.id
  })

  bid1 = await Factory.model('App/Models/Bid').create({
    proposedPrice: 140,
    lotId: lot.id,
    userId: user1.id
  })
})

after(async () => {
  await Database.from('bids')
    .whereIn('id', [bid.id, bid1.id])
    .delete()

  await Database.from('lots')
    .where('id', lot.id)
    .delete()

  await Database.from('users')
    .whereIn('id', [user.id, user1.id])
    .delete()
})

test('Create order (fail) (bad request)', async ({ assert, client }) => {
  const types = [
    'pickup', 'Royal Mail', 'DHL Express',
    'United States Postal Service'
  ]
  const response = await client.post(Route.url('createOrder', { id: lot.id }))
    .field({
      type: 'wrong',
    })
    .loginVia(user1)
    .accept('json')
    .end()

  const failRules = [`type.in:${types}`, 'arrivalLocation.required']

  response.assertStatus(400)
  response.assertJSON(generateErrors(failRules))
})

test('Create order (success)', async ({ assert, client }) => {
  const response = await client.post(Route.url('createOrder', { id: lot.id }))
    .field({
      type: 'pickup',
      arrivalLocation: 'arrival location address'
    })
    .loginVia(user1)
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.orderCreated') })
})
