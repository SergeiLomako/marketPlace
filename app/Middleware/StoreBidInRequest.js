'use strict'

const Antl = use('Antl')
const Bid = use('App/Models/Bid')

class StoreBidInRequest {
  async handle ({ request, response, params }, next) {
    const bid = await Bid.find(params.bidId)
    if (!bid) {
      return response.status(404).json({ message: Antl.formatMessage('messages.notFound') })
    }
    request.bid = bid
    await next()
  }
}

module.exports = StoreBidInRequest
