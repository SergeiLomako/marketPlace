'use strict'

const { test, trait, before, after } = use('Test/Suite')('Lot showing')
const Factory = use('Factory')
const Database = use('Database')
const Route = use('Route')
const Antl = use('Antl')
const { removeJob } = use('App/Helpers/jobs')
const Env = use('Env')
const now = use('moment')()
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

test('Show lots (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.get(Route.url('lots'))
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

test('Show single lot (fail) (auth user not author and status is not "inProcess")', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending'
  })

  await removeJob(lot.inProcessJobId)
  await removeJob(lot.closedJobId)

  const response = await client.get(Route.url('showLot', { id: lot.id }))
    .loginVia(user1, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: Antl.formatMessage('messages.accessDenied')
  })
})

test('Show single lot (success)', async ({ assert, client }) => {
  const format = Env.get('DATE_FORMAT')
  const startTime = now
  const endTime = now.add(1, 'days')
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending',
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString()
  })

  const response = await client.get(Route.url('showLot', { id: lot.id }))
    .loginVia(user, 'jwt')
    .end()

  const { inProcessJobId, closedJobId } = await Database.table('lots').last()
  await removeJob(inProcessJobId)
  await removeJob(closedJobId)

  response.assertStatus(200)
  response.assertJSON({
    currentPrice: lot.currentPrice,
    description: null,
    endTime: endTime.format(format),
    estimatedPrice: lot.estimatedPrice,
    id: lot.id,
    image: null,
    startTime: startTime.format(format),
    status: 'pending',
    title: lot.title,
    'user_id': user.id,
    inProcessJobId,
    closedJobId
  })
})
