import { User } from '@entities/user.entity'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { Role } from '@entities/role.entity'
import { Not } from 'typeorm'
import { Roles } from '@shared/enums'
import * as bcrypt from 'bcryptjs'

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

  async resetPassword(req: any, res: Response) {
    const { oldPassword, newPassword, newPasswordConfirm } = req.body
    console.log(newPassword)
    const userId = req.user.id

    const fields = ['oldPassword', 'newPassword', 'newPasswordConfirm']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const authUser = await User.findOne({
      where: {
        id: userId,
      },
    })

    if (newPasswordConfirm !== newPassword) {
      const response: ErrorBody = {
        message: 'Password confirm is not match',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    if (!authUser || !(await authUser.comparePassword(oldPassword))) {
      const responseData: ErrorBody = {
        message: 'Password is not correct',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(responseData)
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)

    authUser.password = passwordHash
    await authUser.save()

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }

  async getuserProfile(req: any, res: Response) {
    const authUser = await User.findOne({
      where: {
        id: req.user.id,
      },
    })

    if (authUser === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND })
    }

    delete authUser.password

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
      user: authUser,
    })
  }
}
