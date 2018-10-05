'use strict'

const Antl = use('Antl')

class CheckLotInProcessStatus {
  async handle ({ request, response }, next) {
    if (request.lot.status !== 'inProcess') {
      return response.status(403).json({ message: Antl.formatMessage('messages.notInProcess') })
    }
    await next()
  }
}

module.exports = CheckLotInProcessStatus
