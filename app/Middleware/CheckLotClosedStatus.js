'use strict'

const Antl = use('Antl')

class CheckLotClosedStatus {
  async handle ({ request, response }, next) {
    if (request.lot.status !== 'closed') {
      return response.status(403).json({ message: Antl.formatMessage('messages.lotNotClosed') })
    }
    await next()
  }
}

module.exports = CheckLotClosedStatus
