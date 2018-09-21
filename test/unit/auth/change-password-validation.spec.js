'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Change password validation')
const ChangePassword = use('App/Validators/changePassword')
const ChangePasswordValidator = new ChangePassword()
let fakeData
let correctData

test('check validator changePassword (fail)', async ({ assert }) => {
  fakeData = {
    password: '123'
  }

  const validation = await validateAll(fakeData, ChangePasswordValidator.rules, ChangePasswordValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), [{
    field: 'password',
    message: 'Password must be at least 6 characters',
    validation: 'min'
  },
  {
    field: 'password',
    message: 'Passwords do not match',
    validation: 'confirmed'
  },
  {
    field: 'token',
    message: 'Token is required',
    validation: 'required'
  }])
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
