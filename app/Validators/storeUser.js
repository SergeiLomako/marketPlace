'use strict'

const rules = {
  email: 'required|email|unique:users',
  phone: 'required|max:20|unique:users',
  firstname: 'required|string|min:2|max:20',
  lastname: 'required|string|min:2|max:30',
  password: 'required|min:6|max:30',
  dob: 'required|date|before_offset_of:21,years'
}
const messages = use('App/Helpers/validation')(rules)

class StoreUser {
  get validateAll () {
    return true
  }

  get sanitizationRules () {
    return {
      email: 'normalize_email|trim',
      firstname: 'strip_tags|trim',
      lastname: 'strip_tags|trim',
      phone: 'strip_tags|trim'
    }
  }

  get rules () {
    return rules
  }

  get messages () {
    return messages
  }
}

module.exports = StoreUser
