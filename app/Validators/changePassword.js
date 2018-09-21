'use strict'

const rules = {
  password: 'required|min:6|max:30|confirmed',
  token: 'required'
}
const messages = use('App/Helpers/validation')(rules)

class changePassword {
  get validateAll () {
    return true
  }

  get rules () {
    return rules
  }

  get messages () {
    return messages
  }
}

module.exports = changePassword
