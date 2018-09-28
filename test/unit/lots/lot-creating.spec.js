'use strict'

const { test, trait, before } = use('Test/Suite')('Lot creating')
const Env = use('Env')
const Factory = use('Factory')
const moment = use('moment')
const Route = use('Route')
const { generateErrors } = use('App/Helpers/validation')
const Helpers = use('Helpers')
const Database = use('Database')
const Antl = use('Antl')
const { unlink } = use('App/Helpers/files')
let user

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
})

test('Create lot (fail) (bad request)', async ({ assert, client }) => {
  const time = moment().add(1, 'days').toISOString()
  const price = -12
  const response = await client.post(Route.url('lots'))
    .field({
      title: 'short',
      currentPrice: price,
      estimatedPrice: 'wrongData',
      startTime: time,
      endTime: moment().toISOString()
    })
    .accept('json')
    .loginVia(user, 'jwt')
    .end()

  const failRules = [
    'title.min:10', 'currentPrice.above:0', 'estimatedPrice.number',
    `estimatedPrice.above:${price}`, `endTime.after:${time}`
  ]

  response.assertStatus(400)
  response.assertJSON(generateErrors(failRules))
})

test('Create lot (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.post(Route.url('lots'))
    .accept('json')
    .end()

  response.assertStatus(401)
  response.assertJSON({
    message: 'E_INVALID_JWT_TOKEN: jwt must be provided',
    name: 'InvalidJwtToken',
    code: 'E_INVALID_JWT_TOKEN',
    status: 401
  })
})

test('Create lot (fail) (incorrect image)', async ({ assert, client }) => {
  const response = await client.post(Route.url('lots'))
    .field({
      title: 'Testing title',
      currentPrice: 100,
      estimatedPrice: 200,
      startTime: moment().toISOString(),
      endTime: moment().add(1, 'days').toISOString()
    })
    .attach('image', Helpers.appRoot('test/files/notImage.txt'))
    .loginVia(user, 'jwt')
    .end()
  response.assertStatus(400)
  response.assertJSON({
    message: 'Invalid file type plain or text. Only image is allowed'
  })
})

test('Create lot (success)', async ({ assert, client }) => {
  const response = await client.post(Route.url('lots'))
    .field({
      title: 'Testing title',
      currentPrice: 100,
      estimatedPrice: 200,
      startTime: moment().toISOString(),
      endTime: moment().add(1, 'days').toISOString()
    })
    .attach('image', Helpers.appRoot('test/files/nature.jpg'))
    .loginVia(user, 'jwt')
    .end()

  const { image } = await Database.table('lots').last()
  const path = Helpers.publicPath(`${Env.get('IMAGE_FOLDER')}/${image}`)
  await unlink(path)
  response.assertStatus(201)
  response.assertJSON({
    message: Antl.formatMessage('messages.lotCreated')
  })
})
