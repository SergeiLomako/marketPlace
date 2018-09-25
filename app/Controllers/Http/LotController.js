'use strict'

const Lot = use('App/Models/Lot')
const { validateAll, sanitize } = use('Validator')
const Moment = use('moment')
const Messages = use('App/Helpers/validation')
const Helpers = use('Helpers')
const removeFile = Helpers.promisify(require('fs').unlink)

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
      console.log(data)
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
    const currentLot = await Lot.findOrFail(+params.id)

    const sanitizeRules = {
      title: 'strip_tags|trim',
      description: 'strip_tags|trim',
      image: 'strip_tags|trim',
      currentPrice: 'to_int',
      estimatedPrice: 'to_int'
    }

    const requestData = request.only([
      'estimatedPrice',
      'currentPrice',
      'description',
      'startTime',
      'endTime',
      'title',
      'image'
    ])
    const data = sanitize(requestData, sanitizeRules)
    const price = request.input('currentPrice') || currentLot.currentPrice
    const time = request.input('startTime') || currentLot.startTime
    const rules = {
      title: 'string|min:10|max:200',
      description: 'string|min:10|max:300',
      image: 'string|max:200',
      currentPrice: 'number|above:0',
      estimatedPrice: `number|above:${price}`,
      startTime: `date|after:${Moment().format('YYYY-MM-DD HH:mm:ss')}`,
      endTime: `date|after:${time}`
    }

    const messages = Messages(rules)
    const validation = await validateAll(data, rules, messages)
    if (validation.fails()) {
      return validation.messages()
    }

    try {
      console.log(data)
      currentLot.merge(data)
      await currentLot.save()
      response.json({ message: 'Lot updated' })
    } catch ({ message }) {
      response.status(500).json({ message: message })
    }
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
