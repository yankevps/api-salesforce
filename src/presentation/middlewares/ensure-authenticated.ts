import { verify } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import AppError from '../../presentation/errors/app-error'
import env from '../../main/config/env'

export const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw new AppError('JTW token is missing', 401)
  }

  const [, token] = authHeader.split(' ')
  try {
    verify(token, env.jwt_secret)

    return next()
  } catch {
    throw new AppError('Invalid JTW token', 401)
  }
}
