'use strict'

const Route = use('Route')
const Antl = use('Antl')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.post('api/register', 'AuthController.register')
  .validator('storeUser')
  .as('register')

Route.get('api/register/confirm/:confirmationToken', 'AuthController.confirmEmail')
  .as('confirm')

Route.get('api/checkAuth', 'AuthController.checkAuth')
  .as('checkAuth')

Route.post('api/login', 'AuthController.login')
  .validator('loginUser')
  .as('login')

Route.put('api/sendRestorePassword', 'AuthController.sendRestorePasswordEmail')
  .as('sendRestorePassword')

Route.get('api/restorePasswordForm/:restoreToken', 'AuthController.showRestorePasswordForm')
  .as('restoreEmail')

Route.put('api/saveNewPassword', 'AuthController.saveNewPassword')
  .validator('changePassword')
  .as('saveNewPassword')

Route
  .group(() => {
    Route.get('/', 'LotController.index')
      .as('lots')

    Route.get('/:lotId', 'LotController.show')
      .middleware(['storeLotInRequest', 'checkLotAccess'])
      .as('showLot')

    Route.post('/', 'LotController.store')
      .validator('createLot')
      .as('createLot')

    Route.put('/:lotId', 'LotController.update')
      .middleware(['storeLotInRequest', 'checkLotPendingStatus', 'checkLotAuthor'])
      .validator('updateLot')
      .as('updateLot')

    Route.delete('/:lotId', 'LotController.destroy')
      .middleware(['storeLotInRequest', 'checkLotPendingStatus', 'checkLotAuthor'])
      .as('deleteLot')

    Route.post('/:lotId/bids', 'BidController.store')
      .middleware(['storeLotInRequest', 'checkLotInProcessStatus'])
      .validator('createBid')
      .as('createBid')

    Route.get('/:lotId/bids', 'BidController.index')
      .as('bids')

    Route.get('/:lotId/bids/:bidId', 'BidController.show')
      .middleware(['storeLotInRequest', 'storeBidInRequest'])
      .as('showBid')

    Route.get('/:lotId/bids/:bidId/order', ({ response }) => {
      return response.json({ message: Antl.formatMessage('messages.imagineForm') })
    })
      .middleware([
        'storeLotInRequest',
        'checkLotClosedStatus',
        'storeBidInRequest',
        'checkWinner'])
      .as('createOrderForm')

    Route.post('/:lotId/bids/:bidId/order', 'OrderController.store')
      .validator('createOrder')
      .middleware([
        'storeLotInRequest',
        'checkLotClosedStatus',
        'storeBidInRequest',
        'checkBidAuthor',
        'checkWinner'
      ])
      .as('createOrder')

    Route.put('/:lotId/bids/:bidId/order', 'OrderController.update')
      .validator('updateOrder')
      .middleware([
        'storeLotInRequest',
        'storeBidInRequest',
        'checkBidAuthor',
        'checkWinner',
        'storeOrderInRequest',
        'checkOrderPendingStatus'
      ])
      .as('updateOrder')
  })
  .prefix('api/lots')
  .middleware(['auth'])
