'use strict'

const { validateAll } = use('Validator')
const { test } = use('Test/Suite')('Create lot validation')
const CreateLot = use('App/Validators/createLot')
const CreateLotValidator = new CreateLot()
// const generateMessage = use('App/Helpers/validation').generateMessage
const { changeDateFormat, addDays } = use('App/Helpers/date')

test('check validator login (fail)', async ({ assert }) => {
  // const startTime = changeDateFormat(addDays(new Date(), -1))
  const statuses = ['pending', 'inProcess', 'closed']
  const price = -10
  const fakeData = {
    title: 'short',
    status: 'active',
    currentPrice: price,
    estimatedPrice: -20,
    // startTime: startTime,
    endTime: 'wrongFormat'
  }

  await CreateLotValidator.validate(fakeData)

  assert.isTrue(CreateLotValidator.fails())
  // assert.deepEqual(validation.messages(), [
  //   {
  //     field: 'title',
  //     message: generateMessage('title', 'min:10').title,
  //     validation: 'min'
  //   },
  //   {
  //     field: 'status',
  //     message: generateMessage('status', `in:${statuses}`).title,
  //     validation: 'in'
  //   },
  //   {
  //     field: 'currentPrice',
  //     message: generateMessage('currentPrice', 'above:0').title,
  //     validation: 'above'
  //   },
  //   {
  //     field: 'estimatedPrice',
  //     message: generateMessage('estimatedPrice', `above:${price}`).title,
  //     validation: 'above'
  //   },
  //   {
  //     field: 'startTime',
  //     message: generateMessage('startTime', `after:${startTime}`).title,
  //     validation: 'after'
  //   },
  //   {
  //     field: 'endTime',
  //     message: generateMessage('startTime', 'dateFormat:YYYY-MM-DD HH:mm:ss').title,
  //     validation: 'above'
  //   }
  // ])
})

// test('check validator login (success)', async ({ assert }) => {
//   const correctData = {
//     email: 'johndoe@testhosting.com',
//     password: 'qwerty'
//   }
//
//   const validation = await validateAll(correctData, LoginUserValidator.rules, LoginUserValidator.messages)
//
//   assert.isFalse(validation.fails())
// })
