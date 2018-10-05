'use strict'

const { test, trait, before, after } = use('Test/Suite')('Order Show Form')
const Factory = use('Factory')
const Route = use('Route')
const Database = use('Database')
const Antl = use('Antl')
let user
let user1
let user2
let lot
let lotNotClosed

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
  user1 = await Factory.model('App/Models/User').create()
  user2 = await Factory.model('App/Models/User').create()
  lot = await Factory.model('App/Models/Lot').create({
    currentPrice: 100,
    estimatedPrice: 200,
    status: 'closed',
    'user_id': user.id
  })
  lotNotClosed = await Factory.model('App/Models/Lot').create({
    currentPrice: 100,
    estimatedPrice: 200,
    status: 'inProcess',
    'user_id': user.id
  })
})

after(async () => {
  await lot.delete()
  await lotNotClosed.delete()

  await Database.from('users')
    .whereIn('id', [user.id, user1.id, user2.id])
    .delete()
})

test('Show form (fail) (not winner)', async ({ assert, client }) => {
  const bid = await Factory.model('App/Models/Bid').create({
    proposedPrice: 120,
    lotId: lot.id,
    userId: user1.id
  })

  await Factory.model('App/Models/Bid').create({
    proposedPrice: 140,
    lotId: lot.id,
    userId: user2.id
  })

  const response = await client.get(Route.url('createOrderForm', {
    lotId: lot.id,
    bidId: bid.id
  }))
    .loginVia(user1, 'jwt')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.notWinner') })
})

test('Show form (fail) (not closed)', async ({ assert, client }) => {
  await Factory.model('App/Models/Bid').create({
    proposedPrice: 120,
    lotId: lotNotClosed.id,
    userId: user1.id
  })

  const bid = await Factory.model('App/Models/Bid').create({
    proposedPrice: 140,
    lotId: lotNotClosed.id,
    userId: user2.id
  })

  const response = await client.get(Route.url('createOrderForm', {
    lotId: lotNotClosed.id,
    bidId: bid.id
  }))
    .loginVia(user1, 'jwt')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.lotNotClosed') })
})

test('Show form (success)', async ({ assert, client }) => {
  await Factory.model('App/Models/Bid').create({
    proposedPrice: 120,
    lotId: lot.id,
    userId: user1.id
  })

  const bid = await Factory.model('App/Models/Bid').create({
    proposedPrice: 140,
    lotId: lot.id,
    userId: user2.id
  })

  const response = await client.get(Route.url('createOrderForm', {
    lotId: lot.id,
    bidId: bid.id
  }))
    .loginVia(user2, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.imagineForm') })
})
