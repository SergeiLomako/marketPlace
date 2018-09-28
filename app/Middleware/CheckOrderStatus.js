'use strict'

const Order = use('App/Models/Order')
const Antl = use('Antl')

class CheckOrderStatus {
  async handle ({ request, response, params, auth }, next) {
    try {
      const order = await Order.findOrFail(params.id)
      if (order.status !== 'pending') {
        return response.status(403).json({ message: Antl.formatMessage('messages.notPending') })
      }
      await next()
    } catch ({ message }) {
      return response.status(400).json({ message: message })
    }
  }
}

module.exports = CheckOrderStatus
