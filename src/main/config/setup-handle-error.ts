import { Express, NextFunction, Request, Response } from 'express'
import AppError from '../../presentation/errors/app-error'
import logger from './setup-logger'

export default (app: Express): void => {
  app.use((err: Error, _request: Request, response: Response, _: NextFunction) => {
    if (err instanceof AppError) {
      logger.info(JSON.stringify(err))
      return response.status(err.statusCode).json({ status: err.statusCode, message: err.message })
    }

    logger.error(JSON.stringify(err))

    return response.status(500).json({
      status: 500,
      message: 'Internal server error'
    })
  })
}
