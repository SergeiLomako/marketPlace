'use strict'

const { test, trait } = use('Test/Suite')('Lot showing')
const User = use('App/Models/User')
const Lot = use('App/Models/Lot')
const moment = use('moment')

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

test('Show lots (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.get('/lots')
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

test('Show single lot (fail) (auth user not author and status is not "inProcess")', async ({ assert, client }) => {
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
    status: 'pending',
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.get(`/lots/${lot.id}`)
    .loginVia(testUser1, 'jwt')
    .end()
  response.assertStatus(403)
  response.assertJSON({
    message: 'Access denied'
  })
})

test('Show single lot (success)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const startTime = moment()
  const endTime = moment().add(1, 'days')

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    status: 'pending',
    estimatedPrice: 200,
    startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
    endTime: endTime.format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.get(`/lots/${lot.id}`)
    .loginVia(testUser, 'jwt')
    .end()
  response.assertStatus(200)
  response.assertJSON({
    currentPrice: 100,
    description: null,
    endTime: endTime.format('DD.MM.YYYY HH:mm'),
    estimatedPrice: 200,
    id: lot.id,
    image: null,
    startTime: startTime.format('DD.MM.YYYY HH:mm'),
    status: 'pending',
    title: 'Testing title',
    'user_id': testUser.id
  })
})

test('Show single lot (success)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const startTime = moment()
  const endTime = moment().add(1, 'days')

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    status: 'pending',
    estimatedPrice: 200,
    startTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
    endTime: endTime.format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.get(`/lots/${lot.id}`)
    .loginVia(testUser, 'jwt')
    .end()
  response.assertStatus(200)
  response.assertJSON({
    currentPrice: 100,
    description: null,
    endTime: endTime.format('DD.MM.YYYY HH:mm'),
    estimatedPrice: 200,
    id: lot.id,
    image: null,
    startTime: startTime.format('DD.MM.YYYY HH:mm'),
    status: 'pending',
    title: 'Testing title',
    'user_id': testUser.id
  })
})
