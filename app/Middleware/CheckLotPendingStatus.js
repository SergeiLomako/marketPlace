'use strict'

const Antl = use('Antl')

class CheckLotPendingStatus {
  async handle ({ request, response }, next) {
    if (request.lot.status !== 'pending') {
      return response.status(403).json({ message: Antl.formatMessage('messages.notPending') })
    }
    await next()
  }
}

module.exports = CheckLotPendingStatus
