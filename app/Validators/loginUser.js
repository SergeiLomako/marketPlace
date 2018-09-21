'use strict'

const rules = {
  email: 'required|email',
  password: 'required'
}
const messages = use('App/Helpers/validation')(rules)

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
    return messages
  }
}

module.exports = loginUser
