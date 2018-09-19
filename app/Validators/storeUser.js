'use strict'

class StoreUser {
  get sanitizationRules () {
    return {
      email: 'normalize_email|trim',
      firstname: 'strip_tags|trim',
      lastname: 'strip_tags|trim',
      phone: 'strip_tags|trim'
    }
  }

  get rules () {
    return {
      email: 'required|email|unique:users',
      phone: 'required|string|max:20|unique:users',
      firstname: 'required|string|min:2|max:20',
      lastname: 'required|string|min:2|max:30',
      password: 'required|min:6|max:30',
      dob: 'required|date'
    }
  }
}

module.exports = StoreUser
