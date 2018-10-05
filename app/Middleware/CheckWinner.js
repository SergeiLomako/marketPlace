'use strict'

const Antl = use('Antl')
const Database = use('Database')

class CheckWinner {
  async handle ({ request, response }, next) {
    try {
      const maxBid = await Database.select('*')
        .from('bids')
        .where('lot_id', request.lot.id)
        .orderBy('proposedPrice', 'desc')
        .first()
      if (maxBid && maxBid.proposedPrice !== request.bid.proposedPrice) {
        return response.status(403).json({ message: Antl.formatMessage('messages.notWinner') })
      }
      await next()
    } catch ({ message }) { response.status(500).json({ message }) }
  }
}

module.exports = CheckWinner
