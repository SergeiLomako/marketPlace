'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Login validation')
const LoginUser = use('App/Validators/loginUser')
const LoginUserValidator = new LoginUser()
const { generateMessage } = use('App/Helpers/validation')

test('check validator login (fail)', async ({ assert }) => {
  const fakeData = {
    email: 'fake email'
  }

  const validation = await validateAll(fakeData, LoginUserValidator.rules, LoginUserValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), [
    {
      field: 'email',
      message: generateMessage('email', 'email').title,
      validation: 'email'
    },
    {
      field: 'password',
      message: generateMessage('password', 'required').title,
      validation: 'required'
    }
  ])
})

test('check validator login (success)', async ({ assert }) => {
  const correctData = {
    email: 'johndoe@testhosting.com',
    password: 'qwerty'
  }

  const validation = await validateAll(correctData, LoginUserValidator.rules, LoginUserValidator.messages)

  assert.isFalse(validation.fails())
})
