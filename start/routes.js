'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/docs/4.0/routing
|
*/

const Route = use('Route')

Route.get('/', () => {
  return { greeting: 'Hello world in JSON' }
})

Route.post('/register', 'AuthController.register')
  .validator('storeUser')
  .as('register')

Route.get('/register/confirm/:confirmationToken', 'AuthController.confirmEmail')
  .as('confirm')

Route.get('/checkAuth', 'AuthController.checkAuth')
  .as('checkAuth')

Route.post('/login', 'AuthController.login')
  .validator('loginUser')
  .as('login')

Route.put('/sendRestorePassword', 'AuthController.sendRestorePasswordEmail')
  .as('sendRestorePassword')

Route.get('/restorePasswordForm/:restoreToken', 'AuthController.showRestorePasswordForm')
  .as('restoreEmail')

Route.put('/saveNewPassword', 'AuthController.saveNewPassword')
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
  })
  .prefix('lots')
  .middleware(['auth'])
