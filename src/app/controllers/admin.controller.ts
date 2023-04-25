import { User } from '@entities/user.entity'
import { Role } from '@entities/role.entity'
import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { StatusCodes } from 'http-status-codes'
import { Roles } from '@shared/enums'
import * as bcrypt from 'bcryptjs'

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
    const { username, email, password, gender, slackId, roleName } = req.body

    const fields = [
      'email',
      'password',
      'username',
      'gender',
      'slackId',
      'roleName',
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

    // Get the role
    const roleData = await Role.findOne({
      where: {
        name: roleName,
      },
    })

    // Create the new user with role
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

  async changeUserPassword(req: Request, res: Response) {
    // Get the input from Form Body
    const { userId, newPassword, newPasswordConfirm } = req.body

    // Validate Fields
    const fields = ['userId', 'newPassword', 'newPasswordConfirm']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // Compare the new password confirm is correct
    if (newPasswordConfirm !== newPassword) {
      const response: ErrorBody = {
        message: 'Password confirm is not match',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // Check the the user is exsited
    const user = await User.findOne({
      where: {
        id: Number(userId),
      },
    })

    if (user === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND })
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10)

    // Update the current password
    user.password = passwordHash
    await user.save()

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }
}
