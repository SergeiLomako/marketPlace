'use strict'

const Antl = use('Antl')
const Order = use('App/Models/Order')

class StoreOrderInRequest {
  async handle ({ request, response, params }, next) {
    try {
      const order = await Order.query()
        .where('bid_id', params.bidId)
        .first()
      if (!order) {
        return response.status(404).json({ message: Antl.formatMessage('messages.notFound') })
      }
      request.order = order
      await next()
    } catch ({ message }) { response.status(500).json({ message }) }
  }
}

module.exports = StoreOrderInRequest
