'use strict'

const Antl = use('Antl')
const Env = use('Env')

async function checkConstraints (lotInstance, userId, proposedPrice) {
  let error = false
  if (lotInstance['user_id'] === userId) {
    error = Antl.formatMessage('messages.notBetYourLot')
  } else if (lotInstance.status !== 'inProcess') {
    error = Antl.formatMessage('messages.notInProcess')
  } else if (lotInstance.currentPrice >= proposedPrice) {
    error = Antl.formatMessage('messages.bellowCurrentPrice')
  } else {
    const bidsCount = await lotInstance
      .bids()
      .where('user_id', userId)
      .getCount()

    const limit = Env.get('USER_BIDS_LIMIT_PER_LOT')

    if (limit === bidsCount) {
      error = Antl.formatMessage('messages.bidLimitOver', { count: limit })
    }
  }

  return error
}

module.exports = checkConstraints
