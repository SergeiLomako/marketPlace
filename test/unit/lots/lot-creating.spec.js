'use strict'

const { test, trait } = use('Test/Suite')('Lot creating')
const Env = use('Env')
const User = use('App/Models/User')
const moment = use('moment')
const { generateMessage } = use('App/Helpers/validation')
const Helpers = use('Helpers')
const Database = use('Database')
const { unlink } = use('App/Helpers/files')

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

test('Create lot (fail) (bad request)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const time = moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  const price = -12
  const response = await client.post('/lots')
    .field({
      title: 'short',
      currentPrice: price,
      estimatedPrice: 'wrongData',
      startTime: time,
      endTime: moment().format('YYYY-MM-DD HH:mm:ss')
    })
    .accept('json')
    .loginVia(testUser, 'jwt')
    .end()

  response.assertStatus(400)
  response.assertJSON([
    {
      field: 'title',
      message: generateMessage('title', 'min:10').title,
      validation: 'min'
    },
    {
      field: 'currentPrice',
      message: generateMessage('currentPrice', 'above:0').title,
      validation: 'above'
    },
    {
      field: 'estimatedPrice',
      message: generateMessage('estimatedPrice', 'number').title,
      validation: 'number'
    },
    {
      field: 'estimatedPrice',
      message: generateMessage('estimatedPrice', `above:${price}`).title,
      validation: 'above'
    },
    {
      field: 'endTime',
      message: generateMessage('endTime', `after:${time}`).title,
      validation: 'after'
    }
  ])
})

test('Create lot (fail) (not auth)', async ({ assert, client }) => {
  const response = await client.post('/lots')
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
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const response = await client.post('/lots')
    .field({
      title: 'Testing title',
      currentPrice: 100,
      estimatedPrice: 200,
      startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
      endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
    })
    .attach('image', Helpers.appRoot('test/files/notImage.txt'))
    .loginVia(testUser, 'jwt')
    .end()
  response.assertStatus(400)
  response.assertJSON({
    message: 'Invalid file type plain or text. Only image is allowed'
  })
})

test('Create lot (success)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const response = await client.post('/lots')
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

  const { image } = await Database.table('lots').last()
  const path = Helpers.publicPath(`${Env.get('IMAGE_FOLDER')}/${image}`)
  await unlink(path)
  response.assertStatus(201)
  response.assertJSON({
    message: 'Lot created'
  })
})
