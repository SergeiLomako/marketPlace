'use strict'

const Antl = use('Antl')
const Database = use('Database')

class BeforeOrderUpdate {
  async handle ({ request, response, params, auth }, next) {
    const { status, id, userId } = await Database.select('orders.*', 'users.id AS userId')
      .from('lots')
      .innerJoin('bids', 'lots.id', 'bids.lot_id')
      .innerJoin('users', 'bids.user_id', 'users.id')
      .innerJoin('orders', 'bids.id', 'orders.bid_id')
      .where('lots.id', params.id)
      .orderBy('bids.proposedPrice', 'desc')
      .first()
    if (status !== 'pending') {
      return response.status(403).json({ message: Antl.formatMessage('messages.notPending') })
    }
    if (userId !== auth.user.id) {
      return response.status(403).json({ message: Antl.formatMessage('messages.accessDenied') })
    }
    request.orderId = id
    await next()
  }
}

module.exports = BeforeOrderUpdate
