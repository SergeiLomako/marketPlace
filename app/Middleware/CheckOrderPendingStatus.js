'use strict'

const Antl = use('Antl')

class CheckOrderPendingStatus {
  async handle ({ request, response }, next) {
    if (request.order.status !== 'pending') {
      return response.status(403).json({ message: Antl.formatMessage('messages.notPending') })
    }
    await next()
  }
}

module.exports = CheckOrderPendingStatus
