'use strict'

const Lot = use('App/Models/Lot')
const Env = use('Env')
const Bid = use('App/Models/Bid')
const beforeCreateBid = use('App/Helpers/bidCreating')
const Event = use('Event')
const Antl = use('Antl')

class BidController {
  async index ({ params, request, response, auth }) {
    const userId = auth.user.id
    const bids = await Bid.getCurrentLotList(
      params.id,
      request.input('page', 1),
      Env.get('BIDS_PAGINATE')
    )
    bids.rows.forEach(bid => {
      bid['user_id'] = bid['user_id'] === userId
        ? Antl.formatMessage('messages.you')
        : `${Antl.formatMessage('messages.customer')} #${bid.id}`
    })

    response.json(bids)
  }

  async store ({ request, response, params, auth }) {
    try {
      const lot = await Lot.findOrFail(params.id)
      const proposedPrice = request.input('proposedPrice')
      const error = await beforeCreateBid(lot, auth.user.id, proposedPrice)
      if (error) {
        return response.status(400).json({ message: error })
      }
      const bid = await Bid.create({
        'user_id': auth.user.id,
        'lot_id': lot.id,
        proposedPrice
      })

      lot.currentPrice = proposedPrice
      await lot.save()

      if (lot.currentPrice >= lot.estimatedPrice) {
        Event.fire('closedLot', { lot, bid })
      }
      response.json({ message: Antl.formatMessage('messages.bidCreated') })
    } catch ({ message }) {
      response.status(500).json({ message: message })
    }
  }
}

module.exports = BidController
