'use strict'

class changePassword {
  get rules () {
    return {
      password: 'required|min:6|max:30|confirmed'
    }
  }
}

module.exports = changePassword
