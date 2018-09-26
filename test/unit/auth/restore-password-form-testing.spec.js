'use strict'

const { test, trait } = use('Test/Suite')('Restore password form testing')
const User = use('App/Models/User')
const Antl = use('Antl')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check showing restore password form (fail)', async ({ client }) => {
  const token = 'restoreToken'
  await User.create({
    email: 'testingemail@email.test',
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: 'qwerty',
    dob: '2018-10-21',
    confirmationToken: 'confirmationToken',
    restorePasswordToken: token
  })

  const response = await client.get(`/restorePasswordForm/${token}`)
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.imagineForm') })
})

test('check showing restore password form (success)', async ({ client }) => {
  const email = 'testinguser@email.com'
  await User.create({
    email: email,
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: 'qwerty',
    dob: '2018-10-21',
    confirmationToken: 'confirmationToken'
  })

  const response = await client.put('/sendRestorePassword')
    .accept('json')
    .field({
      email: email
    })
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.checkEmail') })
})
