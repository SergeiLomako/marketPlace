'use strict'

const Lot = use('App/Models/Lot')

class CheckAuthor {
  async handle ({ request, auth, params, response }, next) {
    const lot = await Lot.find(+params.id)
    if (lot && lot['user_id'] !== auth.user.id) {
      return response.status(403).json({ message: 'Access denied' })
    }
    await next()
  }
}

module.exports = CheckAuthor
