'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class changePassword {
  get validateAll () {
    return true
  }

  get rules () {
    return {
      password: 'required|min:6|max:30|confirmed',
      restoreToken: 'required'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = changePassword
