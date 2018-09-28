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

Event.on('inProcessLot', async ({ lot }) => {
  lot.status = 'inProcess'
  await lot.save()
})

Event.on('closedLot', async ({ lot }) => {
  lot.status = 'closed'
  await lot.save()
  let email = 'emails.lotNotBuy'

  const bids = await lot.bids().fetch()
  if (bids) {
    email = 'emails.lotBuy'
    const bidUser = await bids[0].user().fetch()
    await Mail.send('emails.lotWin', { bidUser, lot }, (message) => {
      message.to(bidUser.email)
      message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
    })
  }
  const lotUser = await lot.user().fetch()

  await Mail.send(email, { lotUser, lot }, (message) => {
    message.to(lotUser.email)
    message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
  })
})
