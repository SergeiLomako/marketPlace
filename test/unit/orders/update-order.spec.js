'use strict'

const { test, trait, before, after } = use('Test/Suite')('Update order')
const Factory = use('Factory')
const Route = use('Route')
const Database = use('Database')
const Antl = use('Antl')
let user
let user1
let lot
let bid

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
  user1 = await Factory.model('App/Models/User').create()
  lot = await Factory.model('App/Models/Lot').create({ userId: user.id })
  bid = await Factory.model('App/Models/Bid').create({
    lotId: lot.id,
    userId: user1.id
  })
})

after(async () => {
  await Database.from('bids')
    .where('id', bid.id)
    .delete()

  await lot.delete()

  await Database.from('users')
    .whereIn('id', [user.id, user1.id])
    .delete()
})

test('Update order (fail) (no author)', async ({ assert, client }) => {
  await Factory.model('App/Models/Order').create({ bidId: bid.id, status: 'pending' })
  const response = await client.put(Route.url('updateOrder', {
    lotId: lot.id,
    bidId: bid.id
  }))
    .loginVia(user)
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.accessDenied') })
})

test('Update order (fail) (no pending)', async ({ assert, client }) => {
  await Factory.model('App/Models/Order').create({ bidId: bid.id, status: 'sent' })
  const response = await client.put(Route.url('updateOrder', {
    lotId: lot.id,
    bidId: bid.id
  }))
    .loginVia(user1)
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.notPending') })
})

test('Update order (success)', async ({ assert, client }) => {
  await Factory.model('App/Models/Order').create({ bidId: bid.id, status: 'pending' })
  const response = await client.put(Route.url('updateOrder', {
    lotId: lot.id,
    bidId: bid.id
  }))
    .field({
      type: 'pickup',
      arrivalLocation: 'some arrival location'
    })
    .loginVia(user1)
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.orderUpdated') })
})
