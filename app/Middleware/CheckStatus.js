'use strict'

const Lot = use('App/Models/Lot')
const Antl = use('Antl')

class CheckStatus {
  async handle ({ request, response, params, auth }, next) {
    const lot = await Lot.find(params.id)
    if (lot.status !== 'pending') {
      return response.status(403).json({ message: Antl.formatMessage('messages.notPending') })
    }
    await next()
  }
}

module.exports = CheckStatus
