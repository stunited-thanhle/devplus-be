import { Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'

export const authorization = (roles: string[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (roles.includes(req.user.role)) return next()
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: 'You are not allowed' })
  }
}
