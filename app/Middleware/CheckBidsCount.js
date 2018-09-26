'use strict'

class CheckBidsCount {
  async handle ({ request }, next) {
    // call next to advance the request
    await next()
  }
}

module.exports = CheckBidsCount
