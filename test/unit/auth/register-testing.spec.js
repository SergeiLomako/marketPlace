'use strict'

const { test, trait } = use('Test/Suite')('Register testing')
const Event = use('Event')
const Antl = use('Antl')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check register', async ({ assert, client }) => {
  Event.fake()

  const response = await client.post('/register')
    .accept('json')
    .field({
      email: 'johnDoe@testing.com',
      password: 'qwerty',
      phone: '777777777777',
      firstname: 'John',
      lastname: 'Doe',
      dob: '1980-01-01',
      confirmationToken: 'sdfdsfjkjskflksdfsd'
    })
    .end()
  response.assertStatus(201)
  response.assertJSON({ message: Antl.formatMessage('messages.userCreated') })

  const recentEvent = Event.pullRecent()
  assert.equal(recentEvent.event, 'new::user')

  Event.restore()
})
