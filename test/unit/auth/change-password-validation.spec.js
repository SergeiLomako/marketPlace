'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Change password validation')
const ChangePassword = use('App/Validators/changePassword')
const ChangePasswordValidator = new ChangePassword()
const { generateMessage } = use('App/Helpers/validation')

test('check validator changePassword (fail)', async ({ assert }) => {
  const fakeData = {
    password: '123'
  }

  const validation = await validateAll(fakeData, ChangePasswordValidator.rules, ChangePasswordValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), [{
    field: 'password',
    message: generateMessage('password', 'min:6').title,
    validation: 'min'
  },
  {
    field: 'password',
    message: generateMessage('password', 'confirmed').title,
    validation: 'confirmed'
  },
  {
    field: 'token',
    message: generateMessage('token', 'required').title,
    validation: 'required'
  }])
})

test('check validator changePassword (success)', async ({ assert }) => {
  const correctData = {
    password: 'qwerty',
    password_confirmation: 'qwerty',
    token: 'randomString'
  }

  const validation = await validateAll(correctData, ChangePasswordValidator.rules, ChangePasswordValidator.messages)

  assert.isFalse(validation.fails())
})
