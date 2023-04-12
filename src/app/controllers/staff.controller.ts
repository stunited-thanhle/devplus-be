import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { StatusCodes } from 'http-status-codes'
import { User } from '@entities/user.entity'
export class StaffController {
  async createStaffAccount(req: Request, res: Response) {
    const { userName, email, password, gender } = req.body

    const fields = ['email', 'password', 'userName', 'gender']

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
    })

    if (user) {
      const responseData: ErrorBody = {
        message: 'Email have taken!',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(responseData)
    }

    const data = await User.create({
      username: userName,
      gender: gender,
      password: password,
    })
  }
}
