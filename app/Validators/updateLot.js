'use strict'

const now = use('moment')()
const { createMessagesObj } = use('App/Helpers/validation')

class updateLot {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      title: 'strip_tags|trim',
      description: 'strip_tags|trim',
      currentPrice: 'to_int',
      estimatedPrice: 'to_int'
    }
  }

  get rules () {
    const request = this.ctx.request
    const lot = request.lot
    const currentPrice = request.input('currentPrice', lot.currentPrice)
    const startTime = request.input('startTime', lot.startTime)
    return {
      title: 'string|min:10|max:200',
      description: 'string|min:10|max:300',
      currentPrice: 'number|above:0',
      estimatedPrice: `number|above:${currentPrice}`,
      startTime: `date|after:${now.toISOString()}`,
      endTime: `date|after:${startTime}`
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = updateLot
