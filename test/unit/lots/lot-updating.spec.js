'use strict'

const { test, trait, before, after } = use('Test/Suite')('Lot updating')
const now = use('moment')()
const Antl = use('Antl')
const Database = use('Database')
const Factory = use('Factory')
const Route = use('Route')
const { removeJob } = use('App/Helpers/jobs')
const Env = use('Env')
const Lot = use('App/Models/Lot')
const { generateErrors } = use('App/Helpers/validation')
const Helpers = use('Helpers')
const { unlink } = use('App/Helpers/files')
let user
let user1
let lot

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
  user1 = await Factory.model('App/Models/User').create()
  lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending'
  })
})

after(async () => {
  await lot.delete()

  await Database.from('users')
    .whereIn('id', [user.id, user1.id])
    .delete()
})

test('Update lot (fail) (bad request)', async ({ assert, client }) => {
  const price = -12
  const response = await client.put(Route.url('updateLot', { lotId: lot.id }))
    .field({
      title: 'short',
      currentPrice: price,
      estimatedPrice: 'wrongData',
      endTime: now.toISOString(),
      startTime: now.add(1, 'days').toISOString()
    })
    .accept('json')
    .loginVia(user, 'jwt')
    .end()
  const failRules = [
    'title.min:10', 'currentPrice.above:0', 'estimatedPrice.number',
    `estimatedPrice.above:${price}`, `endTime.after:${now.toISOString()}`
  ]

  response.assertStatus(400)
  response.assertJSON(generateErrors(failRules))
})

test('Update lot (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.put(Route.url('updateLot', { lotId: 1 }))
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

test('Update lot (fail) (incorrect image)', async ({ assert, client }) => {
  const response = await client.put(Route.url('updateLot', { lotId: lot.id }))
    .field({
      title: 'Testing title',
      currentPrice: 100,
      estimatedPrice: 200,
      startTime: now.toISOString(),
      endTime: now.add(1, 'days').toISOString()
    })
    .attach('image', Helpers.appRoot('test/files/notImage.txt'))
    .loginVia(user, 'jwt')
    .end()
  response.assertStatus(400)
  response.assertJSON({ message: 'Invalid file type plain or text. Only image is allowed' })
})

test('Update lot (fail) (not author)', async ({ assert, client }) => {
  const response = await client.put(Route.url('updateLot', { lotId: lot.id }))
    .loginVia(user1, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: 'Access denied'
  })
})

test('Update lot (fail) (status not "pending")', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'inProcess'
  })

  await removeJob(lot.inProcessJobId)
  await removeJob(lot.closedJobId)

  const response = await client.put(Route.url('updateLot', { lotId: lot.id }))
    .loginVia(user, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.notPending') })
})

test('Update lot (success)', async ({ assert, client }) => {
  const response = await client.put(Route.url('updateLot', { lotId: lot.id }))
    .field({
      title: 'Testing title',
      currentPrice: 100,
      estimatedPrice: 200,
      startTime: now.toISOString(),
      endTime: now.add(1, 'days').toISOString()
    })
    .attach('image', Helpers.appRoot('test/files/nature.jpg'))
    .loginVia(user, 'jwt')
    .end()

  const { image } = await Lot.findOrFail(lot.id)
  const path = Helpers.publicPath(`${Env.get('IMAGE_FOLDER')}/${image}`)
  await unlink(path)
  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.lotUpdated') })
})
