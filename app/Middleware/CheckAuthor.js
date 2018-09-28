'use strict'

const Lot = use('App/Models/Lot')
const Antl = use('Antl')

class CheckAuthor {
  async handle ({ request, auth, params, response }, next) {
    try {
      const lot = await Lot.findOrFail(params.id)
      if (lot['user_id'] !== auth.user.id) {
        return response.status(403).json({ message: Antl.formatMessage('messages.accessDenied') })
      }
      await next()
    } catch ({ message }){
      return response.status(400).json({ message: message })
    }
  }
}

module.exports = CheckAuthor
