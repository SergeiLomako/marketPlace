'use strict'

const rules = {
  password: 'required|min:6|max:30|confirmed',
  token: 'required'
}
const { createMessagesObj } = use('App/Helpers/validation')

class changePassword {
  get validateAll () {
    return true
  }

  get rules () {
    return rules
  }

  get messages () {
    return createMessagesObj(rules)
  }
}

module.exports = changePassword
