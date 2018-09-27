'use strict'

const { test, trait } = use('Test/Suite')('Restore password email testing')
const Event = use('Event')
const Antl = use('Antl')
const Factory = use('Factory')
const Route = use('Route')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check sending restore password email (fail)', async ({ client }) => {
  const response = await client.put(Route.url('sendRestorePassword'))
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

  const user = await Factory.model('App/Models/User').create()

  const response = await client.put(Route.url('sendRestorePassword'))
    .accept('json')
    .field({
      email: user.email
    })
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.checkEmail') })

  const recentEvent = Event.pullRecent()
  assert.equal(recentEvent.event, 'restore::password')

  Event.restore()
})
