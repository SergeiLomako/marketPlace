
'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Register validation')
const StoreUser = use('App/Validators/storeUser')
const StoreUserValidator = new StoreUser()
const { generateMessage } = use('App/Helpers/validation')

test('check validator register (fail)', async ({ assert }) => {
  const fakeData = {
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
      message: generateMessage('email', 'email').title,
      validation: 'email'
    },
    {
      field: 'phone',
      message: generateMessage('phone', 'max:20').title,
      validation: 'max'
    },
    {
      field: 'firstname',
      message: generateMessage('firstname', 'min:2').title,
      validation: 'min'
    },
    {
      field: 'lastname',
      message: generateMessage('lastname', 'required').title,
      validation: 'required'
    },
    {
      field: 'password',
      message: generateMessage('password', 'min:6').title,
      validation: 'min'
    },
    {
      field: 'dob',
      message: generateMessage('dob', 'date').title,
      validation: 'date'
    },
    {
      field: 'dob',
      message: generateMessage('dob', 'before_offset_of:21').title,
      validation: 'beforeOffsetOf'
    }
  ])
})

test('check validator register (success)', async ({ assert }) => {
  const correctData = {
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
