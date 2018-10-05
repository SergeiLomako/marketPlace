
const { test, trait, before, after } = use('Test/Suite')('Bid Creating')
const Bid = use('App/Models/Bid')
const Route = use('Route')
const { removeJob } = use('App/Helpers/jobs')
const Database = use('Database')
const Factory = use('Factory')
const Env = use('Env')
const { generateErrors } = use('App/Helpers/validation')
const Antl = use('Antl')
let user
let user1
let lotInProcess

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

before(async () => {
  user = await Factory.model('App/Models/User').create()
  user1 = await Factory.model('App/Models/User').create()
  lotInProcess = await Factory.model('App/Models/Lot').create({
    currentPrice: 100,
    estimatedPrice: 200,
    userId: user.id,
    status: 'inProcess'
  })
})

after(async () => {
  await lotInProcess.delete()

  await Database.from('users')
    .whereIn('id', [user.id, user1.id])
    .delete()
})

test('Create bid (fail) (bad request)', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    status: 'inProcess',
    userId: user.id
  })
  await removeJob(lot.inProcessJobId)
  await removeJob(lot.closedJobId)
  const response = await client.post(Route.url('createBid', { lotId: lot.id }))
    .accept('json')
    .loginVia(user1, 'jwt')
    .end()

  response.assertStatus(400)
  response.assertJSON(generateErrors(['proposedPrice.required']))
})

test('Create bid (fail) (lot is not status "inProcess")', async ({ assert, client }) => {
  const lot = await Factory.model('App/Models/Lot').create({
    userId: user.id,
    status: 'closed'
  })

  await removeJob(lot.inProcessJobId)
  await removeJob(lot.closedJobId)

  const response = await client.post(Route.url('createBid', { lotId: lot.id }))
    .accept('json')
    .field({
      proposedPrice: 170
    })
    .loginVia(user1, 'jwt')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.notInProcess') })
})

test('Create bid (fail) (user bid limit exceeded)', async ({ assert, client }) => {
  const bids = [
    {
      proposedPrice: 110,
      'user_id': user1.id,
      'lot_id': lotInProcess.id
    },
    {
      proposedPrice: 120,
      'user_id': user1.id,
      'lot_id': lotInProcess.id
    },
    {
      proposedPrice: 130,
      'user_id': user1.id,
      'lot_id': lotInProcess.id
    }
  ]

  await Bid.createMany(bids)

  const response = await client.post(Route.url('createBid', { lotId: lotInProcess.id }))
    .field({
      proposedPrice: 150
    })
    .loginVia(user1, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(400)
  response.assertJSON({ message: Antl.formatMessage('messages.bidLimitOver', { count: Env.get('USER_BIDS_LIMIT_PER_LOT') }) })
})

test('Create bid (fail) (bid price below current price)', async ({ assert, client }) => {
  await client.post(Route.url('createBid', { lotId: lotInProcess.id }))
    .field({
      'lot_id': lotInProcess.id,
      proposedPrice: 150
    })
    .loginVia(user1, 'jwt')
    .accept('json')
    .end()

  const response = await client.post(Route.url('createBid', { lotId: lotInProcess.id }))
    .field({
      proposedPrice: 130
    })
    .loginVia(user1, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(400)
  response.assertJSON({ message: Antl.formatMessage('messages.bellowCurrentPrice') })
})

test('Create bid (fail) (make a bid on the lot of the current user)', async ({ assert, client }) => {
  const response = await client.post(Route.url('createBid', { lotId: lotInProcess.id }))
    .field({
      'lot_id': lotInProcess.id,
      proposedPrice: 115
    })
    .loginVia(user, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(400)
  response.assertJSON({ message: Antl.formatMessage('messages.notBetYourLot') })
})

test('Create bid (success)', async ({ assert, client }) => {
  const response = await client.post(Route.url('createBid', { lotId: lotInProcess.id }))
    .field({
      'lot_id': lotInProcess.id,
      proposedPrice: 115
    })
    .loginVia(user1, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertJSON({ message: Antl.formatMessage('messages.bidCreated') })
})
