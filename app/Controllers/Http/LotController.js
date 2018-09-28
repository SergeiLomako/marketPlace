'use strict'

const Lot = use('App/Models/Lot')
const Env = use('Env')
const Antl = use('Antl')
const { validateAll, sanitize } = use('Validator')
const moment = use('moment')
const { createMessagesObj } = use('App/Helpers/validation')
const Helpers = use('Helpers')
const { upload, unlink } = use('App/Helpers/files')
const imagePath = Helpers.publicPath(Env.get('IMAGE_FOLDER'))

class LotController {
  async index ({ request, auth, response }) {
    try {
      const lots = await Lot.getList(request, auth.user.id)
      response.json(lots)
    } catch (err) {
      response.status(500).json({ message: Antl.formatMessage('messages.databaseError') })
    }
  }

  async store ({ request, response, auth }) {
    try {
      const data = request.all()
      if (request._files.image) {
        const uploadResult = await upload(request, 'image', imagePath, data.title)
        if (typeof uploadResult === 'object') {
          return response.status(400).json({ message: uploadResult.message })
        }
        data.image = uploadResult
      }
      data['user_id'] = auth.user.id
      await Lot.create(data)
      response.status(201).json({ message: Antl.formatMessage('messages.lotCreated') })
    } catch ({ name, message }) {
      if (name === 'Error') {
        response.status(400).json({ message: message })
      } else {
        response.status(500).json({ message: message })
      }
    }
  }

  async show ({ response, params }) {
    try {
      const lot = await Lot.findOrFail(params.id)
      response.json(lot)
    } catch (err) {
      response.status(404).json({ message: Antl.formatMessage('messages.notFound') })
    }
  }

  async update ({ request, response, auth, params }) {
    const currentLot = await Lot.findOrFail(params.id)

    const sanitizeRules = {
      title: 'strip_tags|trim',
      description: 'strip_tags|trim',
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
    if (request._files.image) {
      const oldImage = currentLot.image
      const title = data.title || currentLot.title
      const uploadResult = await upload(request, 'image', imagePath, title)
      if (typeof uploadResult === 'object') {
        return response.status(400).json({ message: uploadResult.message })
      }
      if (oldImage) {
        await unlink(`${imagePath}/${currentLot.image}`)
      }

      data.image = uploadResult
    }
    const rules = {
      title: 'string|min:10|max:200',
      description: 'string|min:10|max:300',
      currentPrice: 'number|above:0',
      estimatedPrice: `number|above:${price}`,
      startTime: `date|after:${moment().format('YYYY-MM-DD HH:mm:ss')}`,
      endTime: `date|after:${time}`
    }

    const messages = createMessagesObj(rules)
    const validation = await validateAll(data, rules, messages)
    if (validation.fails()) {
      return response.status(400).json(validation.messages())
    }

    try {
      currentLot.merge(data)
      await currentLot.save()
      response.json({ message: Antl.formatMessage('messages.lotUpdated') })
    } catch ({ message }) {
      response.status(500).json({ message: message })
    }
  }

  async destroy ({ response, params }) {
    try {
      const currentLot = await Lot.findOrFail(params.id)
      if (currentLot.image) {
        await unlink(`${imagePath}/${currentLot.image}`)
      }

      await currentLot.delete()
      response.status(200).json({ message: Antl.formatMessage('messages.lotDeleted') })
    } catch (err) {
      response.status(404).json({ message: Antl.formatMessage('messages.notFound') })
    }
  }
}

module.exports = LotController
