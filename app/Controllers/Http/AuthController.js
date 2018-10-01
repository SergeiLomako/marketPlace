'use strict'

const Event = use('Event')
const Env = use('Env')
const Antl = use('Antl')
const Route = use('Route')
const User = use('App/Models/User')
const randomString = require('random-string')

class AuthController {
  async register ({ request, auth, response }) {
    try {
      const confirmationToken = randomString({ length: 40 })
      const url = `${Env.get('APP_URL')}${Route.url('confirm', { confirmationToken })}`
      const { email, password, firstName, lastName, phone, dob } = request.all()
      const user = await User.create({
        confirmationToken,
        firstName,
        lastName,
        password,
        phone,
        email,
        dob
      })

      Event.fire('new::user', { user, url, password })
      response.status(201).json({ message: Antl.formatMessage('messages.userCreated') })
    } catch (err) { response.status(400).json({ message: Antl.formatMessage('messages.badRequest') }) }
  }

  async confirmEmail ({ params, response }) {
    try {
      const user = await User.findBy('confirmationToken', params.confirmationToken)
      user.confirmationToken = null
      user.confirmed = true
      await user.save()

      response.json({ message: Antl.formatMessage('messages.accountActivated') })
    } catch (err) { response.status(400).json({ message: Antl.formatMessage('messages.badRequest') }) }
  }

  async login ({ request, auth, response }) {
    try {
      const { email, password } = request.all()
      await User.findBy('email', email)
      const { token } = await auth.attempt(email, password)
      response.header('Authorization', `Bearer ${token}`)
      response.json({ message: Antl.formatMessage('messages.loginOk') })
    } catch (err) { response.status(400).json({ message: Antl.formatMessage('messages.badRequest') }) }
  }

  async showRestorePasswordForm ({ request, response, params }) {
    try {
      await User.findBy('restorePasswordToken', params.restoreToken)
      response.json({ message: Antl.formatMessage('messages.imagineForm') })
    } catch (err) { response.status(400).json({ message: Antl.formatMessage('messages.badRequest') }) }
  }

  async sendRestorePasswordEmail ({ request, response }) {
    try {
      const user = await User.findBy('email', request.input('email'))
      const restoreToken = randomString({ length: 40 })
      const url = `${Env.get('APP_URL')}${Route.url('restoreEmail', { restoreToken })}`
      user.restorePasswordToken = restoreToken
      await user.save()

      Event.fire('restore::password', { user, url })

      response.json({ message: Antl.formatMessage('messages.checkEmail') })
    } catch (err) { response.status(400).json({ message: Antl.formatMessage('messages.badRequest') }) }
  }

  async saveNewPassword ({ request, response, auth }) {
    try {
      const user = await User.findBy('restorePasswordToken', request.input('restoreToken'))
      user.restorePasswordToken = null
      user.password = request.input('password')
      await user.save()
      const { token } = await auth.attempt(user.email, request.input('password'))
      response.header('Authorization', token)
      response.json({ message: Antl.formatMessage('messages.passwordChanged') })
    } catch ({ message }) { response.status(400).json({ message: Antl.formatMessage('messages.badRequest') }) }
  }

  async checkAuth ({ response, auth }) {
    try {
      await auth.check()
      response.json({ status: true })
    } catch (err) {
      response.status(401).json({ status: false })
    }
  }
}

module.exports = AuthController
