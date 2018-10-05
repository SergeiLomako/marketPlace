'use strict'

const Antl = use('Antl')

class CheckLotAuthor {
  async handle ({ request, auth, params, response }, next) {
    if (request.lot['user_id'] !== auth.user.id) {
      return response.status(403).json({ message: Antl.formatMessage('messages.accessDenied') })
    }
    await next()
  }
}

module.exports = CheckLotAuthor
