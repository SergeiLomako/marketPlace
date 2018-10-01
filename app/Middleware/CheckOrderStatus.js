'use strict'

const Order = use('App/Models/Order')
const Antl = use('Antl')

class CheckOrderStatus {
  async handle ({ request, response, params, auth }, next) {
    const order = await Order.findOrFail(params.id)
    if (order.status !== 'pending') {
      return response.status(403).json({ message: Antl.formatMessage('messages.notPending') })
    }
    await next()
  }
}

module.exports = CheckOrderStatus
