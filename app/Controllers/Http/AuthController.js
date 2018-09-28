'use strict'

const Event = use('Event')
const Env = use('Env')
const Antl = use('Antl')
const Route = use('Route')
const User = use('App/Models/User')
const randomString = require('random-string')

class AuthController {
  async register ({ request, auth, response }) {
    const confirmationToken = randomString({ length: 40 })
    const url = `${Env.get('APP_URL')}${Route.url('confirm', { confirmationToken })}`
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
    response.status(201).json({ message: Antl.formatMessage('messages.userCreated') })
  }

  async confirmEmail ({ params, response }) {
    try {
      const user = await User.findBy('confirmationToken', params.confirmationToken)
      if (!user) {
        throw new Error(Antl.formatMessage('messages.userNotFound'))
      }
      user.confirmationToken = null
      user.confirmed = true
      await user.save()

      response.json({ message: Antl.formatMessage('messages.accountActivated') })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async login ({ request, auth, response }) {
    try {
      const { email, password } = request.all()
      const user = await User.findBy('email', email)
      if (user && user.confirmed === false) {
        throw new Error(Antl.formatMessage('messages.accountNotConfirmed'))
      }
      const { token } = await auth.attempt(email, password)
      response.header('Authorization', `Bearer ${token}`)
      response.json({ message: Antl.formatMessage('messages.loginOk') })
    } catch ({ name, message }) {
      if (name === 'Error') {
        response.status(403).json({ message })
      } else {
        response.status(400).json({ message: Antl.formatMessage('messages.badCredentials') })
      }
    }
  }

  async showRestorePasswordForm ({ request, response, params }) {
    try {
      const user = await User.findBy('restorePasswordToken', params.restoreToken)
      if (!user) {
        throw new Error(Antl.formatMessage('messages.userNotFound'))
      }

      response.json({ message: Antl.formatMessage('messages.imagineForm') })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async sendRestorePasswordEmail ({ request, response }) {
    try {
      const user = await User.findBy('email', request.input('email'))
      if (!user) {
        throw new Error(Antl.formatMessage('messages.userNotFound'))
      }
      const restoreToken = randomString({ length: 40 })
      const url = `${Env.get('APP_URL')}${Route.url('restoreEmail', { restoreToken })}`
      user.restorePasswordToken = restoreToken
      await user.save()

      Event.fire('restore::password', { user, url })

      response.json({ message: Antl.formatMessage('messages.checkEmail') })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async saveNewPassword ({ request, response, auth }) {
    try {
      const user = await User.findBy('restorePasswordToken', request.input('restoreToken'))
      if (!user) {
        throw new Error(Antl.formatMessage('messages.userNotFound'))
      }
      user.restorePasswordToken = null
      user.password = request.input('password')
      await user.save()
      const { token } = await auth.attempt(user.email, request.input('password'))
      response.header('Authorization', token)
      response.json({ message: Antl.formatMessage('messages.passwordChanged') })
    } catch ({ message }) {
      response.status(404).json({ message })
    }
  }

  async checkAuth ({ response, auth }) {
    try {
      await auth.check()
      response.json({ status: true })
    } catch (error) {
      response.status(401).json({ status: false })
    }
  }
}

module.exports = AuthController
