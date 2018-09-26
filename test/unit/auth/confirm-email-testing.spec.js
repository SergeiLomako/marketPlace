'use strict'

const { test, trait } = use('Test/Suite')('Confirm email testing')
const User = use('App/Models/User')
const Antl = use('Antl')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check confirm email (fail)', async ({ assert, client }) => {
  let response = await client.get('/register/confirm/wrongToken')
    .accept('json')
    .end()

  response.assertStatus(404)
  response.assertJSON({ message: Antl.formatMessage('messages.userNotFound') })
})

test('check confirm email (success)', async ({ assert, client }) => {
  const token = 'aaabbbeeerrrtttyyy'
  const email = 'testinguser@email.com'
  await User.create({
    email: email,
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: 'qwerty',
    dob: '1980-10-21',
    confirmationToken: token
  })

  let response = await client.get(`/register/confirm/${token}`)
    .accept('json')
    .end()

  const confirmedUser = await User.findBy('email', email)
  assert.isNotNull(confirmedUser)
  assert.isTrue(confirmedUser.confirmed)
  assert.isNull(confirmedUser.confirmationToken)
  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.accountActivated') })
})
