'use strict'

const { test, trait } = use('Test/Suite')('Login testing')
const Antl = use('Antl')
const Route = use('Route')
const Factory = use('Factory')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check login (fail (bad credentials))', async ({ client }) => {
  const response = await client.post(Route.url('login'))
    .send({
      email: 'notexist@email.com',
      password: 'qwerty'
    })
    .accept('json')
    .end()

  response.assertStatus(400)
  response.assertError({ message: Antl.formatMessage('messages.badCredentials') })
})

test('check login (fail (not confirmed))', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()
  const response = await client.post(Route.url('login'))
    .field({
      email: user.email,
      password: 'qwerty'
    })
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.accountNotConfirmed') })
})

test('check login (success)', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create({ confirmed: true })

  const response = await client.post(Route.url('login'))
    .field({
      email: user.email,
      password: 'qwerty'
    })
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertHeader('authorization', response.headers.authorization)
  response.assertJSON({ message: Antl.formatMessage('messages.loginOk') })
})
