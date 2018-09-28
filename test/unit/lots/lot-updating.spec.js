'use strict'

const { test, trait, before } = use('Test/Suite')('Lot updating')
const moment = use('moment')
const Factory = use('Factory')
const Route = use('Route')
const Env = use('Env')
const Lot = use('App/Models/Lot')
const { generateErrors } = use('App/Helpers/validation')
const Helpers = use('Helpers')
const { unlink } = use('App/Helpers/files')
let user
let user1

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
  user1 = await Factory.model('App/Models/User').create()
})

test('Update lot (fail) (bad request)', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending'
  })

  const time = moment().add(1, 'days').toISOString()
  const price = -12
  const response = await client.put(Route.url('updateLot', { id: lot.id }))
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

test('Update lot (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.put(Route.url('updateLot', { id: 1 }))
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

test('Update lot (fail) (incorrect image)', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending'
  })

  const response = await client.put(Route.url('updateLot', { id: lot.id }))
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

test('Update lot (fail) (not author)', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending'
  })

  const response = await client.put(Route.url('updateLot', { id: lot.id }))
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

  const response = await client.put(Route.url('updateLot', { id: lot.id }))
    .loginVia(user, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: 'Lot is not in the pending status'
  })
})

test('Update lot (success)', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'pending'
  })

  const response = await client.put(Route.url('updateLot', { id: lot.id }))
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

  const { image } = await Lot.findOrFail(lot.id)
  const path = Helpers.publicPath(`${Env.get('IMAGE_FOLDER')}/${image}`)
  await unlink(path)
  response.assertStatus(200)
  response.assertJSON({
    message: 'Lot updated'
  })
})
