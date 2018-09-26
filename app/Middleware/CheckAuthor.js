'use strict'

const Lot = use('App/Models/Lot')
const Antl = use('Antl')

class CheckAuthor {
  async handle ({ request, auth, params, response }, next) {
    const lot = await Lot.find(+params.id)
    if (lot && lot['user_id'] !== auth.user.id) {
      return response.status(403).json({ message: Antl.formatMessage('messages.accessDenied') })
    }
    await next()
  }
}

module.exports = CheckAuthor
