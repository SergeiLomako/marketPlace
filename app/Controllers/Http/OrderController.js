'use strict'

const Antl = use('Antl')
const Order = use('App/Models/Order')

class OrderController {
  async store ({ request, response }) {
    const { type, arrivalLocation } = request.all()
    await Order.create({
      'bid_id': request.bid.id,
      arrivalLocation,
      type
    })

    response.json({ message: Antl.formatMessage('messages.orderCreated') })
  }

  async update ({ request, response }) {
    const order = request.order
    const updateData = {
      type: request.input('type', order.type),
      arrivalLocation: request.input('arrivalLocation', order.arrivalLocation)
    }
    order.merge(updateData)
    try {
      await order.save()
      response.json({ message: Antl.formatMessage('messages.orderUpdated') })
    } catch ({ message }) { response.status(500).json({ message }) }
  }
}

module.exports = OrderController
