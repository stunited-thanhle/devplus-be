import { User } from '@entities/user.entity'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { Role } from '@entities/role.entity'
import { Not } from 'typeorm'
import { Roles } from '@shared/enums'
export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body
    const fields = ['email', 'password']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const user = await User.findOne({
      where: {
        email,
      },
      relations: ['role'],
    })

    if (!user || !(await user.comparePassword(password))) {
      const responseData: ErrorBody = {
        message: 'Invalid email or password',
        statusCode: StatusCodes.UNAUTHORIZED,
      }
      return res.status(StatusCodes.UNAUTHORIZED).json(responseData)
    }

    const token = user.token

    delete user.password

    return res.status(200).json({ user, token })
  }

  async getUsers(req: Request, res: Response) {
    const data = await User.find({})
    return res.status(200).json(data)
  }

  async getRoles(req: any, res: Response) {
    console.log(req.user)
    const currentUser = req.user

    // Admin get all role
    let roles = await Role.find({})

    // Manager get role not include admin
    if (currentUser.role === Roles.Manager) {
      roles = await Role.find({
        where: {
          name: Not(Roles.Admin),
        },
      })
    }

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Sucessfully', statusCode: StatusCodes.OK, roles })
  }
}
