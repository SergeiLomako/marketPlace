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
    try {
      const lots = await Lot.getList(request, auth.user.id)
      response.json(lots)
    } catch ({ message }) {
      response.status(500).json({ message })
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
        response.status(400).json({ message })
      } else {
        response.status(500).json({ message })
      }
    }
  }

  async show ({ response, params }) {
    try {
      const lot = await Lot.findOrFail(params.id)
      response.json(lot)
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async update ({ request, response }) {
    try {
      const currentLot = request.lot
      const data = request.all()
      if (request._files.image) {
        const oldImage = currentLot.image
        const title = data.title || currentLot.title
        const uploadResult = await upload(request, 'image', imagePath, title)
        if (typeof uploadResult === 'object') {
          return response.status(400).json({ message: uploadResult.message })
        }
        if (oldImage) { await unlink(`${imagePath}/${currentLot.image}`) }

        data.image = uploadResult
      }

      currentLot.merge(data)
      await currentLot.save()

      await updateJob(currentLot.inProcessJobId, currentLot.startTime)
      await updateJob(currentLot.closedJobId, currentLot.endTime)

      response.json({ message: Antl.formatMessage('messages.lotUpdated') })
    } catch ({ message }) {
      response.status(500).json({ message })
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
