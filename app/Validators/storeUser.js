'use strict'

const { createMessagesObj } = use('App/Helpers/validation')

class StoreUser {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      email: 'normalize_email|trim',
      firstName: 'strip_tags|trim',
      lastName: 'strip_tags|trim',
      phone: 'strip_tags|trim'
    }
  }

  get rules () {
    return {
      email: 'required|email|unique:users',
      phone: 'required|max:20|unique:users',
      firstName: 'required|string|min:2|max:20',
      lastName: 'required|string|min:2|max:30',
      password: 'required|min:6|max:30',
      dob: 'required|date|beforeOffsetOf:21,years'
    }
  }

  get messages () {
    return createMessagesObj(this.rules)
  }
}

module.exports = StoreUser
