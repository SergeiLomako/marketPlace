'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class loginUser {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      email: 'normalize_email|trim',
      remember: 'to_int'
    }
  }

  get rules () {
    return {
      email: 'required|email',
      password: 'required'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = loginUser
