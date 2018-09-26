'use strict'

const { test, trait } = use('Test/Suite')('Restore password email testing')
const Event = use('Event')
const Antl = use('Antl')
const User = use('App/Models/User')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check sending restore password email (fail)', async ({ client }) => {
  const response = await client.put('/sendRestorePassword')
    .accept('json')
    .field({
      email: 'wrong email'
    })
    .end()

  response.assertStatus(404)
  response.assertJSON({ message: Antl.formatMessage('messages.userNotFound') })
})

test('check sending restore password email (success)', async ({ assert, client }) => {
  Event.fake()

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

  const recentEvent = Event.pullRecent()
  assert.equal(recentEvent.event, 'restore::password')

  Event.restore()
})
