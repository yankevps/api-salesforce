
import express from 'express'
import 'express-async-errors'
import setupRoutes from './setup-routes'
import setupMiddlewares from './setup-middlewares'
import setupHandleError from './setup-handle-error'

const app = express()

setupMiddlewares(app)
setupRoutes(app)
setupHandleError(app)

export default app
