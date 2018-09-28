'use strict'

const Database = use('Database')
const Antl = use('Antl')

class CheckWinner {
  async handle ({ request, response, params, auth }, next) {
    try {
      const winner = await Database.select('bids.*')
        .from('lots')
        .innerJoin('bids', 'lots.id', 'bids.lot_id')
        .where('lots.id', 3)
        .orderBy('bids.proposedPrice', 'desc')
        .first()

      if (winner['user_id'] !== auth.user.id) {
        return response.status(403).json({ message: Antl.formatMessage('messages.notWinner') })
      }
      request.bidId = winner.id
      await next()
    } catch ({ message }) {
      return response.status(400).json({ message: message })
    }
  }
}

module.exports = CheckWinner
