
const { test, trait } = use('Test/Suite')('Bid Creating')
const User = use('App/Models/User')
const Bid = use('App/Models/Bid')
const Lot = use('App/Models/Lot')
const moment = use('moment')
const Env = use('Env')
const { generateMessage } = use('App/Helpers/validation')
const Antl = use('Antl')

trait('DatabaseTransactions')
trait('Test/ApiClient')
trait('Auth/Client')

test('Create bid (fail) (bad request)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const testUser1 = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '77777777777',
    dob: '1980-10-10',
    email: 'tester1@tester.com',
    password: 'qwerty'
  })

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.post(`/lots/${lot.id}/bids`)
    .accept('json')
    .loginVia(testUser1, 'jwt')
    .end()

  response.assertStatus(400)
  response.assertJSON([
    {
      field: 'proposedPrice',
      message: generateMessage('proposedPrice', 'required').title,
      validation: 'min'
    },
    {
      field: 'lot_id',
      message: generateMessage('lot_id', 'required').title,
      validation: 'required'
    }
  ])
})

test('Create bid (fail) (user bid limit exceeded)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const testUser1 = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '77777777777',
    dob: '1980-10-10',
    email: 'tester1@tester.com',
    password: 'qwerty'
  })

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  const bids = [
    {
      proposedPrice: 110,
      'user_id': testUser1.id,
      'lot_id': lot.id
    },
    {
      proposedPrice: 120,
      'user_id': testUser1.id,
      'lot_id': lot.id
    },
    {
      proposedPrice: 130,
      'user_id': testUser1.id,
      'lot_id': lot.id
    }
  ]

  await Bid.createMany(bids)

  const response = await client.post(`/lots/${lot.id}/bids`)
    .field({
      'lot_id': lot.id,
      'user_id': testUser.id,
      proposedPrice: 150
    })
    .loginVia(testUser1, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.bidLimitOver', { count: Env.get('USER_BIDS_LIMIT_PER_LOT') }) })
})

test('Create bid (fail) (bid price below current price)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const testUser1 = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '77777777777',
    dob: '1980-10-10',
    email: 'tester1@tester.com',
    password: 'qwerty'
  })

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  await Bid.create({
    proposedPrice: 140,
    'user_id': testUser1.id,
    'lot_id': lot.id
  })

  const response = await client.post(`/lots/${lot.id}/bids`)
    .field({
      'lot_id': lot.id,
      proposedPrice: 115
    })
    .loginVia(testUser1, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.bellowCurrentPrice') })
})

test('Create bid (fail) (make a bid on the lot of the current user)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.post(`/lots/${lot.id}/bids`)
    .field({
      'lot_id': lot.id,
      proposedPrice: 115
    })
    .loginVia(testUser, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.notBetYourLot') })
})

test('Create bid (success)', async ({ assert, client }) => {
  const testUser = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '7777777777',
    dob: '1980-10-10',
    email: 'tester@tester.com',
    password: 'qwerty'
  })

  const testUser1 = await User.create({
    firstname: 'testuser',
    lastname: 'testuser',
    phone: '77777777777',
    dob: '1980-10-10',
    email: 'tester1@tester.com',
    password: 'qwerty'
  })

  const lot = await Lot.create({
    'user_id': testUser.id,
    title: 'Testing title',
    currentPrice: 100,
    estimatedPrice: 200,
    startTime: moment().format('YYYY-MM-DD HH:mm:ss'),
    endTime: moment().add(1, 'days').format('YYYY-MM-DD HH:mm:ss')
  })

  const response = await client.post(`/lots/${lot.id}/bids`)
    .field({
      'lot_id': lot.id,
      proposedPrice: 115
    })
    .loginVia(testUser1, 'jwt')
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON({ message: Antl.formatMessage('messages.bidCreated') })
})
