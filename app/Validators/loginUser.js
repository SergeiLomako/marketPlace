'use strict'

class loginUser {
  get sanitizationRules () {
    return {
      email: 'normalize_email|trim',
      remember: 'to_int'
    }
  }

  get rules () {
    return {
      email: 'required|email',
      password: 'required',
      remember: 'number'
    }
  }
}

module.exports = loginUser
