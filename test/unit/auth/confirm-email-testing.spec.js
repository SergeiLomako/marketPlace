'use strict'

const { test, trait } = use('Test/Suite')('Confirm email testing')
const User = use('App/Models/User')
const Factory = use('Factory')
const Antl = use('Antl')
const Route = use('Route')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check confirm email (fail)', async ({ assert, client }) => {
  let response = await client.get(Route.url('confirm', { confirmationToken: 'wrongToken' }))
    .accept('json')
    .end()

  response.assertStatus(400)
  response.assertJSON({ message: Antl.formatMessage('messages.badRequest') })
})

test('check confirm email (success)', async ({ assert, client }) => {
  const confirmationToken = 'aaabbbeeerrrtttyyy'
  const user = await Factory.model('App/Models/User').create({ confirmationToken })

  let response = await client.get(Route.url('confirm', { confirmationToken }))
    .accept('json')
    .end()

  const confirmedUser = await User.findBy('email', user.email)
  assert.isNotNull(confirmedUser)
  assert.isTrue(confirmedUser.confirmed)
  assert.isNull(confirmedUser.confirmationToken)
  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.accountActivated') })
})
