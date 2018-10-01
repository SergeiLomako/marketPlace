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

    Route.get('/:id', 'LotController.show')
      .middleware(['checkAccess'])
      .as('showLot')

    Route.post('/', 'LotController.store')
      .validator('createLot')
      .as('createLot')

    Route.put('/:id', 'LotController.update')
      .middleware(['checkStatus', 'checkAuthor'])
      .validator('updateLot')
      .as('updateLot')

    Route.delete('/:id', 'LotController.destroy')
      .middleware(['checkStatus', 'checkAuthor'])
      .as('deleteLot')

    Route.post('/:id/bids', 'BidController.store')
      .validator('createBid')
      .as('createBid')

    Route.get('/:id/bids', 'BidController.index')
      .as('bids')

    Route.get('/:id/bids/:bidId', 'BidController.show')
      .as('showBid')

    Route.get('/:id/order', ({ response }) => {
      return response.json({ message: Antl.formatMessage('messages.imagineForm') })
    })
      .middleware(['checkWinner'])
      .as('createOrderForm')

    Route.post('/:id/order', 'OrderController.store')
      .middleware(['checkWinner'])
      .validator('createOrder')
      .as('createOrder')

    Route.put('/:id/order', 'OrderController.update')
      .middleware(['beforeOrderUpdate'])
      .validator('updateOrder')
      .as('updateOrder')
  })
  .prefix('api/lots')
  .middleware(['auth'])
