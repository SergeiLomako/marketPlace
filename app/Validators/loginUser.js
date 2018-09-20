'use strict'

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
    return {
      'email.required': 'Email is required',
      'email.email': 'Email must be correct email address',
      'password.required': 'Password is required'
    }
  }
}

module.exports = loginUser
