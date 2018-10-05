'use strict'

const Lot = use('App/Models/Lot')
const Env = use('Env')
const { removeJob } = use('App/Helpers/jobs')
const Bid = use('App/Models/Bid')
const beforeCreateBid = use('App/Helpers/bidCreating')
const Event = use('Event')
const Antl = use('Antl')

class BidController {
  async index ({ params, request, response, auth }) {
    const userId = auth.user.id
    try {
      const bids = await Bid.getCurrentLotList(
        params.lotId,
        request.input('page', 1),
        Env.get('BIDS_PAGINATE')
      )
      bids.rows.forEach(bid => {
        bid['user_id'] = bid['user_id'] === userId
          ? Antl.formatMessage('messages.you')
          : `${Antl.formatMessage('messages.customer')} #${bid.id}`
      })

      response.json(bids)
    } catch ({ message }) { response.status(500).json({ message }) }
  }

  async store ({ request, response, auth }) {
    const lot = request.lot
    const proposedPrice = request.input('proposedPrice')
    try {
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

      if (lot.currentPrice >= lot.estimatedPrice) {
        await removeJob(lot.closedJobId)
        Event.fire('closedLot', { lot })
      }
      response.json({ message: Antl.formatMessage('messages.bidCreated') })
    } catch ({ message }) { response.status(500).json({ message }) }
  }
}

module.exports = BidController
