'use strict'

const { test, trait } = use('Test/Suite')('Saving new password testing')
const User = use('App/Models/User')
const Antl = use('Antl')
const Route = use('Route')
const Factory = use('Factory')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check saving new password (fail)', async ({ client }) => {
  const response = await client.put(Route.url('saveNewPassword'))
    .accept('json')
    .field({
      restoreToken: 'wrong token',
      password: 'qwerty',
      password_confirmation: 'qwerty'
    })
    .end()

  response.assertStatus(404)
  response.assertJSON({ message: Antl.formatMessage('messages.userNotFound') })
})

test('check saving new password (success)', async ({ assert, client }) => {
  const confirmationToken = 'confirmationToken'
  const restoreToken = 'restorePasswordToken'
  const user = await Factory.model('App/Models/User')
    .create({ confirmationToken, restoreToken })
  const response = await client.put('/saveNewPassword')
    .accept('json')
    .field({
      password: 'qwerty',
      password_confirmation: 'qwerty',
      restoreToken
    })
    .end()

  const checkUser = await User.findBy('email', user.email)

  assert.isNotNull(checkUser)
  assert.isNull(checkUser.restorePasswordToken)
  response.assertHeader('authorization', response.headers.authorization)
  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.passwordChanged') })
})
