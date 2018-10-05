'use strict'

const Lot = use('App/Models/Lot')
const Env = use('Env')
const { updateJob } = use('App/Helpers/jobs')
const Antl = use('Antl')
const Helpers = use('Helpers')
const { upload, unlink } = use('App/Helpers/files')
const imagePath = Helpers.publicPath(Env.get('IMAGE_FOLDER'))

class LotController {
  async index ({ request, auth, response }) {
    const { myLots, page, filter } = request.all()
    try {
      const lots = await Lot.getList(page, myLots, filter, auth.user.id)
      response.json(lots)
    } catch ({ message }) { response.status(500).json({ message }) }
  }

  async store ({ request, response, auth }) {
    const data = request.all()
    if (request._files.image) {
      const uploadResult = await upload(request, 'image', imagePath, data.title)
      if (typeof uploadResult === 'object') {
        return response.status(400).json({ message: uploadResult.message })
      }
      data.image = uploadResult
    }
    data['user_id'] = auth.user.id
    try {
      await Lot.create(data)
      response.status(201).json({ message: Antl.formatMessage('messages.lotCreated') })
    } catch ({ message }) { response.status(500).json({ message }) }
  }

  async show ({ request, response }) {
    return response.json(request.lot)
  }

  async update ({ request, response }) {
    const currentLot = request.lot
    const data = request.all()
    if (request._files.image) {
      const title = data.title || currentLot.title
      const uploadResult = await upload(request, 'image', imagePath, title)
      if (typeof uploadResult === 'object') {
        return response.status(400).json({ message: uploadResult.message })
      }
      await unlink(`${imagePath}/${currentLot.image}`)

      data.image = uploadResult
    }

    currentLot.merge(data)
    try {
      await currentLot.save()
      await updateJob(currentLot.inProcessJobId, currentLot.startTime)
      await updateJob(currentLot.closedJobId, currentLot.endTime)
    } catch ({ message }) { response.status(500).json({ message }) }

    response.json({ message: Antl.formatMessage('messages.lotUpdated') })
  }

  async destroy ({ request, response }) {
    try {
      await unlink(`${imagePath}/${request.lot.image}`)
      await request.lot.delete()
      response.status(200).json({ message: Antl.formatMessage('messages.lotDeleted') })
    } catch ({ message }) { response.status(500).json({ message }) }
  }
}

module.exports = LotController
