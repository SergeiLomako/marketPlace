'use strict'
const moment = use('moment')

const messages = use('App/Helpers/validation')

class CreateLot {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      title: 'strip_tags|trim',
      description: 'strip_tags|trim',
      image: 'strip_tags|trim',
      currentPrice: 'to_int',
      estimatedPrice: 'to_int'
    }
  }

  get rules () {
    const statuses = ['pending', 'inProcess', 'closed']
    const request = this.ctx.request.all()

    return {
      title: 'required|string|min:10|max:200',
      description: 'string|min:10|max:300',
      image: 'string|max:200',
      status: `required|in:${statuses}`,
      currentPrice: 'required|number|above:0',
      estimatedPrice: `required|number|above:${request.currentPrice}`,
      startTime: `required|date|after:${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      endTime: `required|date|after:${request.startTime}`
    }
  }

  get messages () {
    return messages(this.rules)
  }
}

module.exports = CreateLot
