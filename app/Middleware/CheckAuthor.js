'use strict'

const Lot = use('App/Models/Lot')

class CheckAuthor {
  async handle ({ request, auth, params, response }, next) {
    try {
      const lot = Lot.find(+params.id)
      if (lot && lot['user_id'] !== auth.user.id) {
        throw Error('Access denied')
      }
      await next()
    } catch ({ message }) {
      response.status(403).json({ message: message })
    }
  }
}

module.exports = CheckAuthor
