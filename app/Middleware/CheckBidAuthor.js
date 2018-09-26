'use strict'

class CheckBidAuthor {
  async handle ({ request }, next) {
    // call next to advance the request
    await next()
  }
}

module.exports = CheckBidAuthor
