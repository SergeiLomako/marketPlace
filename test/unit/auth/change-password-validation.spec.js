'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Change password validation')
const ChangePassword = use('App/Validators/changePassword')
const ChangePasswordValidator = new ChangePassword()
const { generateErrors } = use('App/Helpers/validation')

test('check validator changePassword (fail)', async ({ assert }) => {
  const fakeData = {
    password: '123'
  }

  const failRules = ['password.min:6', 'password.confirmed', 'restoreToken.required']

  const validation = await validateAll(fakeData, ChangePasswordValidator.rules, ChangePasswordValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), generateErrors(failRules))
})

test('check validator changePassword (success)', async ({ assert }) => {
  const correctData = {
    password: 'qwerty',
    password_confirmation: 'qwerty',
    restoreToken: 'randomString'
  }

  const validation = await validateAll(correctData, ChangePasswordValidator.rules, ChangePasswordValidator.messages)

  assert.isFalse(validation.fails())
})
