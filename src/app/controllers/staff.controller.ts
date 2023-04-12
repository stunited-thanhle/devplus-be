import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { StatusCodes } from 'http-status-codes'
import { User } from '@entities/user.entity'

import { Role } from '@entities/role.entity'
import { Group } from '@entities/group.entity'
import { Roles } from '@shared/enums'

export class StaffController {
  async createStaffAccount(req: Request, res: Response) {
    const { username, email, password, gender } = req.body

    const fields = ['email', 'password', 'username', 'gender']

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
    const staffRole = await Role.findOne({
      where: {
        name: Roles.Staff,
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
      email,
      username,
      gender,
      password,
      role: staffRole,
    }).save()

    delete data.password
    return res.status(StatusCodes.CREATED).json(data)
  }

  async editStaffAccount(req: Request, res: Response) {
    const { username, gender } = req.body
    const staffId = parseInt(req.params.id)

    const fields = ['username', 'gender']

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
        id: staffId,
      },
      relations: ['role'],
    })

    if (user === null || user?.role.name !== Roles.Staff) {
      const response: ErrorBody = {
        message: 'Bad request',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    user.username = username
    user.gender = gender
    await user.save()

    return res.status(StatusCodes.NO_CONTENT).json('')
  }

  async assignStaffToGroup(req: Request, res: Response) {
    const staffId: number = parseInt(req.params.id)
    const { groupId }: { groupId: number } = req.body

    const existedGroup = await Group.findOne({
      where: {
        id: groupId,
      },
    })

    const user = await User.findOne({
      where: {
        id: staffId,
      },
      relations: ['role'],
    })

    if (
      user === null ||
      user?.role.name !== Roles.Staff ||
      existedGroup === null
    ) {
      const response: ErrorBody = {
        message: 'Bad request',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // assign staff to group
    existedGroup.users = [user]
    await existedGroup.save()

    return res.status(StatusCodes.NO_CONTENT).json('')
  }

  async unAssignStaffToGroup(req: Request, res: Response) {
    const staffId: number = parseInt(req.params.id)
    const { groupId }: { groupId: number } = req.body

    const existedGroup = await Group.findOne({
      where: {
        id: groupId,
      },
      relations: ['users'],
    })

    const currentUser = await User.findOne({
      where: {
        id: staffId,
      },
      relations: ['role'],
    })

    if (
      currentUser === null ||
      currentUser?.role.name !== Roles.Staff ||
      existedGroup === null
    ) {
      const response: ErrorBody = {
        message: 'Bad request',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // un-assign staff to group
    existedGroup.users = existedGroup.users.filter((user) => {
      return user.id !== currentUser.id
    })

    await existedGroup.save()

    return res.status(StatusCodes.NO_CONTENT).json('')
  }
}
