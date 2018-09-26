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

Route.get('/register/confirm/:token', 'AuthController.confirmEmail').as('confirm')

Route.get('/checkAuth', 'AuthController.checkAuth')

Route.post('/login', 'AuthController.login')
  .validator('loginUser')

Route.post('/logout', 'AuthController.logout')
  .middleware(['auth'])

Route.put('/sendRestorePassword', 'AuthController.sendRestorePasswordEmail')

Route.get('/restorePasswordForm/:token', 'AuthController.showRestorePasswordForm').as('restoreEmail')

Route.put('/saveNewPassword', 'AuthController.saveNewPassword')
  .validator('changePassword')

Route
  .group(() => {
    Route.get('/', 'LotController.index')

    Route.get('/:id', 'LotController.show')
      .middleware(['checkAccess'])

    Route.post('/', 'LotController.store')
      .validator('createLot')

    Route.put('/:id', 'LotController.update')
      .middleware(['checkStatus', 'checkAuthor'])

    Route.put('/:id/changePrice', 'LotController.changePrice')
      .middleware(['changePrice'])

    Route.delete('/:id', 'LotController.destroy')
      .middleware(['checkStatus', 'checkAuthor'])
  })
  .prefix('lots')
  .middleware(['auth'])
