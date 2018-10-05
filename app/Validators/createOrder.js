'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class createOrder {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      arrivalLocation: 'strip_tags|trim'
    }
  }

  get rules () {
    const types = [
      'pickup', 'Royal Mail', 'DHL Express',
      'United States Postal Service'
    ]
    return {
      type: `required|in:${types}`,
      arrivalLocation: 'required|max:100'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = createOrder
