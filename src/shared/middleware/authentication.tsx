import { User } from '@entities/user.entity'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

export const authentication = async (
  req: Request & { user: User },
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.header['Authorization']
    if (token)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: 'Invalid Authentication' })
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET) as {
      id: number
    }
    if (!decode)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: 'Invalid Authentication' })
    const user = await User.findOneBy({ id: decode.id })
    req.user = user
    return next()
  } catch (error: any) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message })
  }
}
