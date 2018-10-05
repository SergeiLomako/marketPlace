
'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Register validation')
const StoreUser = use('App/Validators/storeUser')
const StoreUserValidator = new StoreUser()
const { generateErrors } = use('App/Helpers/validation')

test('check validator register (fail)', async ({ assert }) => {
  const fakeData = {
    email: 'fake email',
    phone: 4564564565464554545454544544545,
    firstName: 'i',
    password: 'test',
    dob: 'testDate'
  }

  const failRules = [
    'email.email', 'phone.max:20', 'firstName.min:2', 'lastName.required',
    'password.min:6', 'dob.date', 'dob.beforeOffsetOf:21'
  ]

  const validation = await validateAll(fakeData, StoreUserValidator.rules, StoreUserValidator.messages)

  assert.isTrue(validation.fails())
  assert.deepEqual(validation.messages(), generateErrors(failRules))
})

test('check validator register (success)', async ({ assert }) => {
  const correctData = {
    email: 'johndoe@testhosting.com',
    phone: '06606060707',
    firstName: 'John',
    lastName: 'Doe',
    password: 'qwerty',
    dob: '1980-02-20'
  }

  const validation = await validateAll(correctData, StoreUserValidator.rules, StoreUserValidator.messages)

  assert.isFalse(validation.fails())
})
