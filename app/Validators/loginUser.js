'use strict'

const rules = {
  email: 'required|email',
  password: 'required'
}
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
    return rules
  }

  get messages () {
    return createMessagesObj(rules)
  }
}

module.exports = loginUser
