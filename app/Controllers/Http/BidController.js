'use strict'

const Lot = use('App/Models/Lot')
const Bid = use('App/Models/Bid')
const beforeCreate = use('App/Helpers/bidCreating')
const Event = use('Event')
const Antl = use('Antl')

class BidController {
  async index ({ params, response }) {
    const bids = await Bid.query().paginate(1, 5)
    console.log(bids.toJSON())
  }

  async show ({ params }) {

  }

  async store ({ request, response, params, auth }) {
    try {
      const lot = await Lot.findOrFail(+params.id)
      const proposedPrice = request.input('proposedPrice')
      const error = await beforeCreate(lot, auth.user.id, proposedPrice)
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
