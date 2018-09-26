'use strict'

const Lot = use('App/Models/Lot')

class CheckStatus {
  async handle ({ request, response, params, auth }, next) {
    const lot = await Lot.find(+params.id)
    if (lot.status !== 'pending') {
      return response.status(403).json({ message: 'Lot is not in the pending status' })
    }
    await next()
  }
}

module.exports = CheckStatus
