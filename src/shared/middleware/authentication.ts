import { User } from '@entities/user.entity'
import { Roles } from '@shared/enums'
import { ErrorBody } from '@shared/interface/errorInterface'
import { NextFunction, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import { Equal } from 'typeorm'

export const authentication = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const getToken = req.header('Authorization')
    if (!getToken) {
      const errorBody: ErrorBody = {
        message: 'There is no authorization',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(errorBody)
    }

    const token = getToken.split(' ')[1]
    if (!token) {
      const errorBody: ErrorBody = {
        message: 'Authorization is not in the correct format',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.UNAUTHORIZED).json(errorBody)
    }

    const decode = jwt.verify(token, process.env.SECRET) as {
      id: number
      role: string
    }

    if (!decode) {
      const errorBody: ErrorBody = {
        message: 'Invalid Authentication',
        statusCode: StatusCodes.UNAUTHORIZED,
      }
      return res.status(StatusCodes.UNAUTHORIZED).json(errorBody)
    }

    let currentRole: Roles
    switch (decode.role) {
      case Roles.Admin:
        currentRole = Roles.Admin
        break
      case Roles.Manager:
        currentRole = Roles.Manager
        break
      case Roles.Master:
        currentRole = Roles.Master
        break
      case Roles.Staff:
        currentRole = Roles.Staff
        break
      default:
        currentRole = Roles.Staff
        break
    }

    const user = await User.findOne({
      relations: ['role'],
      where: {
        id: decode.id,
        role: {
          name: Equal(currentRole),
        },
      },
    })

    if (!user) {
      const errorBody: ErrorBody = {
        message: 'This token is not valid',
        statusCode: StatusCodes.UNAUTHORIZED,
      }
      return res.status(StatusCodes.UNAUTHORIZED).json(errorBody)
    }
    req.user = decode
    return next()
  } catch (error: any) {
    const errorBody: ErrorBody = {
      message: error.message,
      statusCode: StatusCodes.UNAUTHORIZED,
    }
    return res.status(StatusCodes.BAD_REQUEST).json(errorBody)
  }
}
