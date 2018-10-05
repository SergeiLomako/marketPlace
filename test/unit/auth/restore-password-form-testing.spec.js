'use strict'

const { test, trait } = use('Test/Suite')('Restore password form testing')
const Factory = use('Factory')
const Antl = use('Antl')
const Route = use('Route')

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check showing restore password form', async ({ client }) => {
  const restoreToken = 'restoreToken'
  await Factory.model('App/Models/User').create({ restoreToken })

  const response = await client.get(Route.url('restoreEmail', { restoreToken }))
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.imagineForm') })
})

test('check send restore password email', async ({ client }) => {
  const user = await Factory.model('App/Models/User').create()

  const response = await client.put(Route.url('sendRestorePassword'))
    .accept('json')
    .field({
      email: user.email
    })
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.checkEmail') })
})
