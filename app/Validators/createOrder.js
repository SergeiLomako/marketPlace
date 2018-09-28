'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class createOrder {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      arrivalLocation: 'strip_tags|trim',
      bidId: 'to_int'
    }
  }

  get rules () {
    const statuses = ['pending', 'sent', 'delivered']
    const types = [
      'pickup', 'Royal Mail', 'DHL Express',
      'United States Postal Service'
    ]
    return {
      status: `required|in:${statuses}`,
      type: `required|in:${types}`,
      arrivalLocation: 'required|max:100',
      bidId: 'required'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = createOrder
