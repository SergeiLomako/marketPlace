'use strict'

class CheckPriceDifference {
  async handle ({ request }, next) {
    // call next to advance the request
    await next()
  }
}

module.exports = CheckPriceDifference
