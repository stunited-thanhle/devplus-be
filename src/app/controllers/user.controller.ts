import { Role } from '@entities/role.entity'
import { User } from '@entities/user.entity'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { RequestDayOffController } from './request.controller'

export class UsersController {
  async create(req: Request, res: Response) {
    const { email, password, username, role, gender, slackId } = req.body

    const fields = [
      'email',
      'password',
      'username',
      'role',
      'slackId',
      'gender',
    ]

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const dataToCheck = [
      { model: User, field: 'email', value: email },
      { model: User, field: 'username', value: username },
      { model: User, field: 'slackId', value: slackId },
    ]

    for (const { model, field, value } of dataToCheck) {
      const exists = await ValidateHelper.checkExistence(model, field, value)
      if (exists) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `${field} already exists`,
          statusCode: StatusCodes.BAD_REQUEST,
        })
      }
    }

    const roleData = await Role.findOne({
      where: {
        id: role,
      },
    })

    const data = await User.create({
      email,
      password,
      username,
      role: roleData,
      slackId: slackId,
      gender,
    }).save()

    return res.status(200).json(data)
  }

  async getUsers(req: Request, res: Response) {
    console.log(req.body.payload)
    // const requestController = new RequestDayOffController()

    // await requestController.approveRequest(req, res)

    return res.status(200).json({ message: 'success' })
  }
}
