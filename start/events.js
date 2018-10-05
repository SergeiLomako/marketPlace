'use strict'

const Event = use('Event')
const Env = use('Env')
const Mail = use('Mail')
const Lot = use('App/Models/Lot')
const Database = use('Database')

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

Event.on('inProcessLot', async ({ id }) => {
  const lot = await Lot.findOrFail(id)
  lot.status = 'inProcess'
  await lot.save()
})

Event.on('closedLot', async ({ id }) => {
  const lot = await Lot.findOrFail(id)
  lot.status = 'closed'
  await lot.save()
  let email = 'emails.lotNotBuy'

  const maxBid = await Database.select('bids.*')
    .from('bids')
    .where('bids.lot_id', lot.id)
    .orderBy('bids.proposedPrice', 'desc')
    .first()
  if (maxBid) {
    email = 'emails.lotBuy'
    const bidUser = await Database.select('users.*')
      .from('users')
      .where('users.id', maxBid['user_id'])
      .first()
    await Mail.send('emails.lotWin', { bidUser, lot }, (message) => {
      message.to(bidUser.email)
      message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
    })
  }
  const lotUser = await Database.select('users.*')
    .from('users')
    .where('users.id', lot['user_id'])
    .first()

  await Mail.send(email, { lotUser, lot }, (message) => {
    message.to(lotUser.email)
    message.from(Env.get('ADMIN_EMAIL', 'admin@admin.com'))
  })
})
