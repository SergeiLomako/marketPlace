'use strict'

const { validateAll } = use('Validator')
const { test, trait } = use('Test/Suite')('Auth')
const Event = use('Event')
const User = use('App/Models/User')
const StoreUser = use('App/Validators/storeUser')
const LoginUser = use('App/Validators/loginUser')
const ChangePassword = use('App/Validators/changePassword')
const StoreUserValidator = new StoreUser()
const LoginUserValidator = new LoginUser()
const ChangePasswordValidator = new ChangePassword()
let fakeData = {}
let correctData = {}

trait('DatabaseTransactions')
trait('Test/ApiClient')

test('check validator register (fail)', async ({ assert }) => {
  fakeData = {
    email: 'fake email',
    phone: 4564564565464554545454544544545,
    firstname: 'i',
    password: 'test',
    dob: 'testDate'
  }

  const validation = await validateAll(fakeData, StoreUserValidator.rules, StoreUserValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), [
    {
      field: 'email',
      message: 'Email must be correct email address',
      validation: 'email'
    },
    {
      field: 'phone',
      message: 'Phone must be no more than 20 characters',
      validation: 'max'
    },
    {
      field: 'firstname',
      message: 'Firstname must be at least 2 characters',
      validation: 'min'
    },
    {
      field: 'lastname',
      message: 'Lastname is required',
      validation: 'required'
    },
    {
      field: 'password',
      message: 'Password must be at least 6 characters',
      validation: 'min'
    },
    {
      field: 'dob',
      message: 'Date of birth must be correct date',
      validation: 'date'
    }
  ])
})

test('check validator register (success)', async ({ assert }) => {
  correctData = {
    email: 'johndoe@testhosting.com',
    phone: '06606060707',
    firstname: 'John',
    lastname: 'Doe',
    password: 'qwerty',
    dob: '2018-02-20'
  }

  const validation = await validateAll(correctData, StoreUserValidator.rules, StoreUserValidator.messages)

  assert.isFalse(validation.fails())
})

test('check validator login (fail)', async ({ assert }) => {
  fakeData = {
    email: 'fake email'
  }

  const validation = await validateAll(fakeData, LoginUserValidator.rules, LoginUserValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), [
    {
      field: 'email',
      message: 'Email must be correct email address',
      validation: 'email'
    },
    {
      field: 'password',
      message: 'Password is required',
      validation: 'required'
    }
  ])
})

test('check validator login (success)', async ({ assert }) => {
  correctData = {
    email: 'johndoe@testhosting.com',
    password: 'qwerty'
  }

  const validation = await validateAll(correctData, LoginUserValidator.rules, LoginUserValidator.messages)

  assert.isFalse(validation.fails())
})

test('check validator changePassword (fail)', async ({ assert }) => {
  fakeData = {
    password: '123'
  }

  const validation = await validateAll(fakeData, ChangePasswordValidator.rules, ChangePasswordValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), [
    {
      field: 'password',
      message: 'Password must be at least 6 characters',
      validation: 'min'
    },
    {
      field: 'password',
      message: 'Passwords not match',
      validation: 'confirmed'
    },
    {
      field: 'token',
      message: 'Token is required',
      validation: 'required'
    }
  ])
})

test('check validator changePassword (success)', async ({ assert }) => {
  correctData = {
    password: 'qwerty',
    password_confirmation: 'qwerty',
    token: 'randomString'
  }

  const validation = await validateAll(correctData, ChangePasswordValidator.rules, ChangePasswordValidator.messages)

  assert.isFalse(validation.fails())
})

test('check login (fail (bad credentials))', async ({ client }) => {
  const response = await client.post('/login')
    .send({
      email: 'notexist@email.com',
      password: 'qwerty'
    })
    .accept('json')
    .end()

  response.assertStatus(400)
  response.assertError(
    {
      message: 'Bad credentials given'
    }
  )
})

test('check login (fail (not confirmed))', async ({ client }) => {
  const password = 'qwerty'
  const testUser = await User.create({
    email: 'testinguser@email.com',
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: password,
    dob: '2018-10-21'
  })

  const response = await client.post('/login')
    .field({
      email: testUser.email,
      password: password
    })
    .accept('json')
    .end()

  response.assertStatus(403)
  response.assertJSON(
    {
      message: 'Account not confirmed'
    }
  )
})

test('check login (success)', async ({ client }) => {
  const password = 'qwerty'
  const testUser = await User.create({
    email: 'testinguser@email.com',
    phone: '1234567890',
    firstname: 'John',
    lastname: 'Doe',
    password: password,
    dob: '2018-10-21',
    confirmed: true
  })

  const response = await client.post('/login')
    .field({
      email: testUser.email,
      password: password
    })
    .accept('json')
    .end()

  response.assertStatus(200)
  response.assertHeader('authorization', response.headers.authorization)
  response.assertJSON(
    {
      message: 'Login OK'
    }
  )
})

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
      dob: '2018-01-01',
      confirmationToken: 'sdfdsfjkjskflksdfsd'
    })
    .end()

  response.assertStatus(201)
  response.assertJSON(
    {
      message: 'User created'
    }
  )

  const recentEvent = Event.pullRecent()
  assert.equal(recentEvent.event, 'new::user')

  Event.restore()
})

test('check confirm email (fail)', async ({ assert, client }) => {
  let response = await client.get('/register/confirm/wrongToken')
    .accept('json')
    .end()

  response.assertStatus(404)
  response.assertJSON(
    {
      message: 'User not found'
    }
  )
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
    dob: '2018-10-21',
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
  response.assertJSON(
    {
      message: 'Your account is activated!'
    }
  )
})

test('check showing restore password email form (fail)', async ({ client }) => {
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
  response.assertJSON(
    {
      message: 'Imagine that here the form of changing the password'
    }
  )
})

test('check showing restore password email form (success)', async ({ client }) => {
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
  response.assertJSON(
    {
      message: 'Check your email!'
    }
  )
})

test('check sending restore password email (fail)', async ({ client }) => {
  const response = await client.put('/sendRestorePassword')
    .accept('json')
    .field({
      email: 'wrong email'
    })
    .end()

  response.assertStatus(404)
  response.assertJSON(
    {
      message: 'User not found'
    }
  )
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
  response.assertJSON(
    {
      message: 'Check your email!'
    }
  )

  const recentEvent = Event.pullRecent()
  assert.equal(recentEvent.event, 'restore::password')

  Event.restore()
})

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
  response.assertJSON(
    {
      message: 'User not found'
    }
  )
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
  response.assertStatus(200)
  response.assertJSON(
    {
      message: 'Password successfully changed'
    }
  )
})
