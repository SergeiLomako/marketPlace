'use strict'

const Server = use('Server')
const globalMiddleware = [
  'Adonis/Middleware/BodyParser'
]

const namedMiddleware = {
  auth: 'Adonis/Middleware/Auth',
  checkLotPendingStatus: 'App/Middleware/CheckLotPendingStatus',
  checkLotInProcessStatus: 'App/Middleware/CheckLotInProcessStatus',
  checkLotAuthor: 'App/Middleware/CheckLotAuthor',
  checkLotAccess: 'App/Middleware/CheckLotAccess',
  checkBidAuthor: 'App/Middleware/CheckBidAuthor',
  storeBidInRequest: 'App/Middleware/StoreBidInRequest',
  storeLotInRequest: 'App/Middleware/StoreLotInRequest',
  checkWinner: 'App/Middleware/CheckWinner',
  checkLotClosedStatus: 'App/Middleware/CheckLotClosedStatus',
  checkOrderPendingStatus: 'App/Middleware/CheckOrderPendingStatus',
  storeOrderInRequest: 'App/Middleware/StoreOrderInRequest'
}

const serverMiddleware = [
  'Adonis/Middleware/Static',
  'Adonis/Middleware/Cors'
]

Server
  .registerGlobal(globalMiddleware)
  .registerNamed(namedMiddleware)
  .use(serverMiddleware)
