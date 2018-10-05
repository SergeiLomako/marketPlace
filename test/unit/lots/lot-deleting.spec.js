'use strict'

const { test, trait, before, after } = use('Test/Suite')('Lot deleting')
const Factory = use('Factory')
const Route = use('Route')
const { removeJob } = use('App/Helpers/jobs')
const Antl = use('Antl')
const now = use('moment')()
const Helpers = use('Helpers')
const Database = use('Database')
let user
let user1

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
  user1 = await Factory.model('App/Models/User').create()
})

after(async () => {
  await Database.from('users')
    .whereIn('id', [user.id, user1.id])
    .delete()
})

test('Delete lot (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.delete(Route.url('deleteLot', { lotId: 1 }))
    .accept('json')
    .end()

  response.assertStatus(401)
  assert.include(response.body, {
    message: 'E_INVALID_JWT_TOKEN: jwt must be provided',
    name: 'InvalidJwtToken',
    code: 'E_INVALID_JWT_TOKEN',
    status: 401
  })
})

test('Delete lot (fail) (not author)', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending'
  })

  await removeJob(lot.inProcessJobId)
  await removeJob(lot.closedJobId)

  const response = await client.delete(Route.url('deleteLot', { lotId: lot.id }))
    .loginVia(user1, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: Antl.formatMessage('messages.accessDenied')
  })
})

test('Delete lot (fail) (status not "pending")', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'inProcess'
  })
  await removeJob(lot.inProcessJobId)
  await removeJob(lot.closedJobId)

  const response = await client.delete(Route.url('deleteLot', { lotId: lot.id }))
    .loginVia(user, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: Antl.formatMessage('messages.notPending')
  })
})

test('Delete lot (success)', async ({ assert, client }) => {
  await client.post(Route.url('lots'))
    .field({
      title: 'Testing title',
      currentPrice: 100,
      estimatedPrice: 200,
      startTime: now.add(1, 'days').toISOString(),
      endTime: now.add(2, 'days').toISOString()
    })
    .attach('image', Helpers.appRoot('test/files/nature.jpg'))
    .loginVia(user, 'jwt')
    .end()

  const { id } = await Database.table('lots').last()
  const response = await client.delete(Route.url('deleteLot', { lotId: id }))
    .loginVia(user, 'jwt')
    .end()

  response.assertStatus(200)
  response.assertJSON({
    message: Antl.formatMessage('messages.lotDeleted')
  })
})
