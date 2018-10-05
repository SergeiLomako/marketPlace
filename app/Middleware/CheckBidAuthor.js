'use strict'

const Antl = use('Antl')

class CheckBidAuthor {
  async handle ({ request, response, auth }, next) {
    if (request.bid['user_id'] !== auth.user.id) {
      return response.status(403).json({ message: Antl.formatMessage('messages.accessDenied') })
    }
    await next()
  }
}

module.exports = CheckBidAuthor
