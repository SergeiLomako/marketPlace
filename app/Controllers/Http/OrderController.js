'use strict'

const Antl = use('Antl')
const Order = use('App/Models/Order')

class OrderController {
  async store ({ request, response }) {
    try {
      const { type, arrivalLocation } = request.all()
      await Order.create({
        'bid_id': request.bidId,
        arrivalLocation,
        type
      })

      response.json({ message: Antl.formatMessage('messages.orderCreated') })
    } catch ({ message }) {
      response.status(400).json({ message })
    }
  }

  async update ({ request, response }) {
    try {
      const order = await Order.findOrFail(request.orderId)
      const updateData = {
        status: request.input('status', order.status),
        type: request.input('type', order.type),
        arrivalLocation: request.input('arrivalLocation', order.arrivalLocation)
      }
      order.merge(updateData)
      await order.save()
      response.json({ message: Antl.formatMessage('messages.orderUpdated') })
    } catch ({ message }) {
      response.status(500).json({ message })
    }
  }
}

module.exports = OrderController
