import { User } from '@entities/user.entity'
import { Role } from '@entities/role.entity'
import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { StatusCodes } from 'http-status-codes'
import { Roles } from '@shared/enums'

export class AdminController {
  async getManager(req: Request, res: Response) {
    const target = await User.findOneBy({ id: parseInt(req.params.id) })
    if (!target || target?.role.name !== Roles.Manager) {
      const response: ErrorBody = {
        message: 'Manager is not exist',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }
    return res.status(StatusCodes.OK).json(target)
  }
  async getLstManager(req: Request, res: Response) {
    const managerRole = await Role.findOneBy({ name: Roles.Manager })
    const lstManager = await User.find({
      where: {
        role: {
          id: managerRole.id,
        },
      },
    })
    return res.status(StatusCodes.OK).json(lstManager)
  }
  async createManager(req: Request, res: Response) {
    const fields = ['email', 'password', 'username', 'gender', 'slackId']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const { username, email, password, gender, slackId } = req.body

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
        name: Roles.Manager,
      },
    })

    const data = await User.create({
      email,
      username,
      gender,
      password,
      role: roleData,
      slackId,
    }).save()

    return res.status(StatusCodes.OK).json(data)
  }

  async updateManager(req: Request, res: Response) {
    const fields = ['username', 'gender', 'slackId']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const { username, gender, slackId } = req.body

    const dataToCheck = [{ model: User, field: 'username', value: username }]

    for (const { model, field, value } of dataToCheck) {
      const exists = await ValidateHelper.checkExistence(model, field, value)
      if (exists) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `${field} already exists`,
          statusCode: StatusCodes.BAD_REQUEST,
        })
      }
    }

    const target = await User.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['role'],
    })
    if (!target || target?.role.name !== Roles.Manager) {
      const response: ErrorBody = {
        message: 'Manager is not exist',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }
    target.username = username
    target.gender = gender
    target.slackId = slackId
    await target.save()
    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
    })
  }

  async deleteManager(req: Request, res: Response) {
    const target = await User.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['role'],
    })
    if (!target || target?.role.name !== Roles.Manager) {
      const response: ErrorBody = {
        message: 'Manager is not exist',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }
    await User.remove(target)
    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
    })
  }
}
