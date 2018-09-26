'use strict'

const { test, trait } = use('Test/Suite')('Lot deleting')
const User = use('App/Models/User')
const Lot = use('App/Models/Lot')
const moment = use('moment')
const Helpers = use('Helpers')
const Database = use('Database')

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

test('Delete lot (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.delete('/lots/1')
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

test('Delete lot (fail) (not author)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const testUser1 = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '77777777777',
    dob: '1980-10-10',
    email: 'tester1@tester.com',
    password: 'qwerty'
  })

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.delete(`/lots/${lot.id}`)
    .loginVia(testUser1, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: 'Access denied'
  })
})

test('Delete lot (fail) (status not "pending")', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    status: 'inProcess',
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.delete(`/lots/${lot.id}`)
    .loginVia(testUser, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: 'Lot is not in the pending status'
  })
})

test('Delete lot (success)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  await client.post('/lots')
    .field({
      title: 'Testing title',
      currentPrice: 100,
      estimatedPrice: 200,
      startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
    })
    .attach('image', Helpers.appRoot('test/files/nature.jpg'))
    .loginVia(testUser, 'jwt')
    .end()

  const { id } = await Database.table('lots').last()
  const response = await client.delete(`/lots/${id}`)
    .loginVia(testUser, 'jwt')
    .end()
  response.assertStatus(200)
  response.assertJSON({
    message: 'Lot deleted'
  })
})
