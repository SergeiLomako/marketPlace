'use strict'

const Event = use('Event')
const Env = use('Env')
const Mail = use('Mail')

Event.on('new::user', async (data) => {
  try {
    await Mail.send('emails.registration', data, (message) => {
      message.to(data.user.email)
      message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
    })
  } catch ({ message }) {
    return { message }
  }
})

Event.on('restore::password', async (data) => {
  try {
    await Mail.send('emails.restorePassword', data, (message) => {
      message.to(data.user.email)
      message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
    })
  } catch ({ message }) {
    return { message }
  }
})
