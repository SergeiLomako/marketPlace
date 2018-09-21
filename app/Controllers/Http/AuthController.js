'use strict'

const Event = use('Event')
const Env = use('Env')
const Route = use('Route')
const User = use('App/Models/User')
const randomString = require('random-string')

class AuthController {
  async register ({ request, auth, response }) {
    const confirmationToken = randomString({ length: 40 })
    const url = Env.get('APP_URL') + Route.url('confirm', { token: confirmationToken })
    const { email, password, firstname, lastname, phone, dob } = request.all()
    const user = await User.create({
      confirmationToken,
      firstname,
      lastname,
      password,
      phone,
      email,
      dob
    })

    Event.fire('new::user', { user, url, password })
    response.status(201).json({ message: 'User created' })
  }

  async confirmEmail ({ params, response }) {
    try {
      const user = await User.findBy('confirmationToken', params.token)
      if (!user) {
        throw new Error('User not found')
      }
      user.confirmationToken = null
      user.confirmed = true
      await user.save()

      response.json({ message: 'Your account is activated!' })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async login ({ request, auth, response }) {
    try {
      const { email, password } = request.all()
      const user = await User.findBy('email', email)
      if (user && user.confirmed === false) {
        throw new Error('Account not confirmed')
      }
      const { token } = await auth.attempt(email, password)
      response.header('Authorization', token)
      response.json({ message: 'Login OK' })
    } catch ({ name, message }) {
      if (name === 'Error') {
        response.status(403).json({ message })
      } else {
        response.status(400).json({ message: 'Bad credentials given' })
      }
    }
  }

  async showRestorePasswordForm ({ request, response, params }) {
    try {
      const user = await User.findBy('restorePasswordToken', params.token)
      if (!user) {
        throw new Error('User not found')
      }

      response.json({ message: 'Imagine that here the form of changing the password' })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async sendRestorePasswordEmail ({ request, response }) {
    try {
      const user = await User.findBy('email', request.input('email'))
      if (!user) {
        throw new Error('User not found')
      }
      const restoreToken = randomString({ length: 40 })
      const url = `${Env.get('APP_URL')}${Route.url('restoreEmail', { token: restoreToken })}`
      user.restorePasswordToken = restoreToken
      await user.save()

      Event.fire('restore::password', { user, url })

      response.json({ message: 'Check your email!' })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async saveNewPassword ({ request, response, auth }) {
    try {
      const user = await User.findBy('restorePasswordToken', request.input('token'))
      if (!user) {
        throw new Error('User not found')
      }
      user.restorePasswordToken = null
      user.password = request.input('password')
      await user.save()
      const { token } = await auth.attempt(user.email, request.input('password'))
      response.header('Authorization', token)
      response.json({ message: 'Password successfully changed' })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }
}

module.exports = AuthController
