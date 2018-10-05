'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class createBid {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      proposedPrice: 'to_int'
    }
  }

  get rules () {
    return {
      proposedPrice: 'required|above:0'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = createBid
