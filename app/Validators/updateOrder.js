'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class updateOrder {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      arrivalLocation: 'strip_tags|trim',
    }
  }

  get rules () {
    const types = [
      'pickup', 'Royal Mail', 'DHL Express',
      'United States Postal Service'
    ]
    return {
      type: `in:${types}`,
      arrivalLocation: 'max:100'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = updateOrder
