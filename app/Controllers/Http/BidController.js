'use strict'

const Lot = use('App/Models/Lot')
const Bid = use('App/Models/Bid')
const beforeCreateBid = use('App/Helpers/bidCreating')
const Event = use('Event')
const Antl = use('Antl')

class BidController {
  async index ({ params, response, auth }) {
    const bids = await Bid.query().paginate(1, 5)
    bids.data.foreEach(bid => {
      bid['user_id'] = bid['user_id'] === auth.user.id
        ? Antl.formatMessage('messages.you')
        : `${Antl.formatMessage('messages.customer')} # ${bid.id}`
    })

    console.log()
  }

  async store ({ request, response, params, auth }) {
    try {
      const lot = await Lot.findOrFail(params.id)
      const proposedPrice = request.input('proposedPrice')
      const error = await beforeCreateBid(lot, auth.user.id, proposedPrice)
      if (error) {
        return response.status(400).json({ message: error })
      }
      await Bid.create({
        'user_id': auth.user.id,
        'lot_id': lot.id,
        proposedPrice
      })

      lot.currentPrice = proposedPrice
      await lot.save()

      // Event.fire('changeLotPrice', { lot, bid })

      response.json({ message: Antl.formatMessage('messages.bidCreated') })
    } catch ({ message }) {
      response.status(500).json({ message: message })
    }
  }
}

module.exports = BidController
