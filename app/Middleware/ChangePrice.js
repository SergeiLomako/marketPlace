'use strict'

class ChangePrice {
  async handle ({ request }, next) {
    // call next to advance the request
    await next()
  }
}

module.exports = ChangePrice
