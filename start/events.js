'use strict'

const Event = use('Event')
const Env = use('Env')
const Mail = use('Mail')

Event.on('new::user', async (data) => {
  await Mail.send('emails.registration', data, (message) => {
    message.to(data.user.email)
    message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
  })
})

Event.on('restore::password', async (data) => {
  await Mail.send('emails.restorePassword', data, (message) => {
    message.to(data.user.email)
    message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
  })
})

Event.on('closedLot', async ({ lot }) => {
  lot.status = 'closed'
  await lot.save()
})
