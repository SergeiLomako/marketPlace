'use strict'

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
    return {
      email: 'required|email|unique:users',
      phone: 'required|max:20|unique:users',
      firstname: 'required|string|min:2|max:20',
      lastname: 'required|string|min:2|max:30',
      password: 'required|min:6|max:30',
      dob: 'required|date'
    }
  }

  get messages () {
    return {
      'email.required': 'Email is required',
      'email.email': 'Email must be correct email address',
      'email.unique': 'Email already exists',
      'phone.required': 'Phone is required',
      'phone.max': 'Phone must be no more than 20 characters',
      'phone.unique': 'Phone already exists',
      'firstname.required': 'Firstname is required',
      'firstname.min': 'Firstname must be at least 2 characters',
      'firstname.max': 'Firstname must be no more than 30 characters',
      'firstname.string': 'Firstname must be string',
      'lastname.required': 'Lastname is required',
      'lastname.min': 'Lastname must be at least 2 characters',
      'lastname.max': 'Lastname must be no more than 30 characters',
      'lastname.string': 'Lastname must be string',
      'password.required': 'Password is required',
      'password.min': 'Password must be at least 6 characters',
      'password.max': 'Password must be no more than 30 characters',
      'dob.required': 'Date of birth is required',
      'dob.date': 'Date of birth must be correct date'
    }
  }
}

module.exports = StoreUser
