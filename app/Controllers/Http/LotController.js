'use strict'

const Lot = use('App/Models/Lot')

class LotController {
  async index ({ request, auth, response }) {
    try {
      const lots = await Lot.getList(request, auth.user.id)
      response.json(lots)
    } catch (err) {
      response.status(500).json({ message: 'Database error. Try again later' })
    }
  }

  async store ({ request, response, auth }) {
    try {
      const data = request.all()
      data['user_id'] = auth.user.id
      await Lot.create(data)
      response.status(201).json({ message: 'Lot created' })
    } catch (err) {
      response.status(500).json({ message: 'Database error. Try again later' })
    }
  }

  async show ({ response, params }) {
    try {
      const lot = await Lot.findOrFail(+params.id)
      response.json(lot)
    } catch (err) {
      response.status(404).json({ message: 'Not found' })
    }
  }

  async update ({ request, response, auth, params }) {
    const data = request.all()
    await Lot.findOrFail(+params.id).update(data)
    response.status(200).json({ message: 'Lot updated' })
  }

  async changePrice ({ request, response, auth, params }) {
    try {
      let message = 'Estimated price updated'
      const price = +request.input('price')
      const lot = await Lot.findOrFail(+params.id)
      if (lot.estimatedPrice <= price) {
        lot.status = 'closed'
        message = 'Estimated price updated and lot closed'
        // TODO Order create
      }
      lot.estimatedPrice = price
      await lot.save()

      response.status(200).json({ message })
    } catch (err) {
      response.status(404).json({ message: 'Not found' })
    }
  }

  async destroy ({ response, params }) {
    try {
      await Lot.findOrFail(+params.id).delete()
      response.status(200).json({ message: 'Lot deleted' })
    } catch (err) {
      response.status(404).json({ message: 'Not found' })
    }
  }
}

module.exports = LotController
