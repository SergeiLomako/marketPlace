'use strict'

const Lot = use('App/Models/Lot')
const Antl = use('Antl')

class StoreLotInRequest {
  async handle ({ request, response, params }, next) {
    const lot = await Lot.find(params.lotId)
    if (!lot) {
      return response.status(404).json({ message: Antl.formatMessage('messages.notFound') })
    }
    request.lot = lot
    await next()
  }
}

module.exports = StoreLotInRequest
