'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Login validation')
const LoginUser = use('App/Validators/loginUser')
const LoginUserValidator = new LoginUser()
let fakeData
let correctData

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
