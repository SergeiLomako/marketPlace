'use strict'

const { test, trait } = use('Test/Suite')('Check Auth')
const Route = use('Route')
const Factory = use('Factory')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('checkAuth()  (false)', async ({ assert, client }) => {
  const response = await client.get(Route.url('checkAuth'))
    .header('Authorization', 'wrongToken')
    .end()

  response.assertStatus(401)
  response.assertJSON({ status: false })
})

test('checkAuth()  (true)', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({ confirmed: true })
  const loginResponse = await client.post(Route.url('login'))
    .field({
      email: user.email,
      password: 'qwerty'
    })
    .accept('json')
    .end()

  const token = loginResponse.headers.authorization
  const checkResponse = await client.get(Route.url('checkAuth'))
    .header('Authorization', token)
    .end()

  checkResponse.assertStatus(200)
  checkResponse.assertJSON({ status: true })
})
