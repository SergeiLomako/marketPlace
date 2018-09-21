
'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Register validation')
const StoreUser = use('App/Validators/storeUser')
const StoreUserValidator = new StoreUser()
let fakeData
let correctData

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
      message: 'Dob must be correct date',
      validation: 'date'
    },
    {
      field: 'dob',
      message: 'You must be over 21 years old',
      validation: 'beforeOffsetOf'
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
    dob: '1980-02-20'
  }

  const validation = await validateAll(correctData, StoreUserValidator.rules, StoreUserValidator.messages)

  assert.isFalse(validation.fails())
})
