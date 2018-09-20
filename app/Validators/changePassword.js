'use strict'

class changePassword {
  get validateAll () {
    return true
  }

  get rules () {
    return {
      password: 'required|min:6|max:30|confirmed',
      token: 'required'
    }
  }

  get messages () {
    return {
      'password.required': 'Password is required',
      'password.confirmed': 'Passwords not match',
      'password.min': 'Password must be at least 6 characters',
      'password.max': 'Password must be no more than 30 characters',
      'token.required': 'Token is required'
    }
  }
}

module.exports = changePassword
