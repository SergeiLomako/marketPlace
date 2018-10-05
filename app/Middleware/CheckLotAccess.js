'use strict'

const Antl = use('Antl')

class CheckLotAccess {
  async handle ({ request, auth, params, response }, next) {
    if (request.lot['user_id'] !== auth.user.id && request.lot.status !== 'inProcess') {
      return response.status(403).json({ message: Antl.formatMessage('messages.accessDenied') })
    }
    await next()
  }
}

module.exports = CheckLotAccess
