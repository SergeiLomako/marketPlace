'use strict'

const Lot = use('App/Models/Lot')

class CheckStatus {
  async handle ({ request, response, params, auth }, next) {
    try {
      const lot = await Lot.find(+params.id)
      if (lot.status !== 'pending') {
        throw new Error('Lot is not in the pending status')
      }
      await next()
    } catch ({ message }) {
      response.status(403).json({ message: message })
    }
  }
}

module.exports = CheckStatus
