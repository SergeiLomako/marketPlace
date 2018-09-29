'use strict'

const Server = use('Server')
const globalMiddleware = [
  'Adonis/Middleware/BodyParser'
]

const namedMiddleware = {
  auth: 'Adonis/Middleware/Auth',
  checkStatus: 'App/Middleware/CheckStatus',
  checkAuthor: 'App/Middleware/CheckAuthor',
  checkAccess: 'App/Middleware/CheckAccess',
  checkWinner: 'App/Middleware/CheckWinner'
}

const serverMiddleware = [
  'Adonis/Middleware/Static',
  'Adonis/Middleware/Cors'
]

Server
  .registerGlobal(globalMiddleware)
  .registerNamed(namedMiddleware)
  .use(serverMiddleware)
