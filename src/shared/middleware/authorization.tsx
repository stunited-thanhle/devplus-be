import { User } from '@entities/user.entity'
import { Request, Response, NextFunction } from 'express'
import { StatusCodes } from 'http-status-codes'

export const authorization = (roles: string[]) => {
  return (req: Request & { user: User }, res: Response, next: NextFunction) => {
    if (roles.includes(req.user.role.name)) return next()
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ msg: 'You are not allowed' })
  }
}
