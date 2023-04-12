import { User } from '@entities/user.entity'
import { NextFunction, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'

export const authentication = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.headers['Authorization']
    if (!token)
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
    if (!user)
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ msg: 'Invalid Authentication' })
    req.user = user
    return next()
  } catch (error: any) {
    return res.status(StatusCodes.BAD_REQUEST).json({ msg: error.message })
  }
}
