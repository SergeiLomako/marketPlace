'use strict'

const { test, trait } = use('Test/Suite')('Check Auth')
const User = use('App/Models/User')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('checkAuth()  (false)', async ({ assert, client }) => {
  const response = await client.get('/checkAuth')
    .header('Authorization', 'wrongToken')
    .end()

  response.assertStatus(401)
  response.assertJSON({ status: false })
})

test('checkAuth()  (true)', async ({ assert, client }) => {
  const email = 'testinguser@testing.com'
  const password = 'qwerty'
  await User.create({
    firstname: 'test',
    lastname: 'test',
    email: email,
    password: password,
    phone: 7777777777,
    confirmed: true,
    dob: '1980-10-10'
  })

  const loginResponse = await client.post('/login')
    .field({
      email: email,
      password: password
    })
    .accept('json')
    .end()

  const token = loginResponse.headers.authorization

  const checkResponse = await client.get('/checkAuth')
    .header('Authorization', token)
    .end()

  checkResponse.assertStatus(200)
  checkResponse.assertJSON({ status: true })
})
