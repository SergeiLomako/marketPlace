'use strict'

const { test, trait } = use('Test/Suite')('Login testing')
const User = use('App/Models/User')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check login (fail (bad credentials))', async ({ client }) => {
  const response = await client.post('/login')
    .send({
      email: 'notexist@email.com',
      password: 'qwerty'
    })
    .accept('json')
    .end()

  response.assertStatus(400)
  response.assertError({ message: 'Bad credentials given' })
})

test('check login (fail (not confirmed))', async ({ client }) => {
  const password = 'qwerty'
  const testUser = await User.create({
    email: 'testinguser@email.com',
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: password,
    dob: '2018-10-21'
  })

  const response = await client.post('/login')
    .field({
      email: testUser.email,
      password: password
    })
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: 'Account not confirmed' })
})

test('check login (success)', async ({ client }) => {
  const password = 'qwerty'
  const testUser = await User.create({
    email: 'testinguser@email.com',
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: password,
    dob: '2018-10-21',
    confirmed: true
  })

  const response = await client.post('/login')
    .field({
      email: testUser.email,
      password: password
    })
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertHeader('authorization', response.headers.authorization)
  response.assertJSON({ message: 'Login OK' })
})
