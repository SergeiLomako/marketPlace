'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class updateOrder {
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
      status: `in:${statuses}`,
      type: `in:${types}`,
      arrivalLocation: 'max:100'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = updateOrder
