'use strict'

const { test, trait } = use('Test/Suite')('Saving new password testing')
const User = use('App/Models/User')
const Antl = use('Antl')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check saving new password (fail)', async ({ client }) => {
  const response = await client.put('/saveNewPassword')
    .accept('json')
    .field({
      token: 'wrong token',
      password: 'qwerty',
      password_confirmation: 'qwerty'
    })
    .end()

  response.assertStatus(404)
  response.assertJSON({ message: Antl.formatMessage('messages.userNotFound') })
})

test('check saving new password (success)', async ({ assert, client }) => {
  const email = 'testinguser123@email.com'
  const token = 'restorePasswordToken'
  await User.create({
    email: email,
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: 'qwerty',
    dob: '2018-10-21',
    confirmationToken: 'confirmationToken',
    restorePasswordToken: token
  })
  const response = await client.put('/saveNewPassword')
    .accept('json')
    .field({
      token: token,
      password: 'qwerty',
      password_confirmation: 'qwerty'
    })
    .end()

  const user = await User.findBy('email', email)

  assert.isNotNull(user)
  assert.isNull(user.restorePasswordToken)
  response.assertHeader('authorization', response.headers.authorization)
  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.passwordChanged') })
})
