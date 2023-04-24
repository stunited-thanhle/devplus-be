import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { StatusCodes } from 'http-status-codes'
import { User } from '@entities/user.entity'

import { Role } from '@entities/role.entity'
import { Roles } from '@shared/enums'

export class StaffController {
  async getListStaff(req: Request, res: Response) {
    const { groupId } = req.query

    const newGroupId = Number(groupId)

    const staffs = await User.find({
      where: {
        role: {
          name: Roles.Staff,
        },
        groups: {
          id: newGroupId,
        },
      },
    })

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK, staffs })
  }

  async createStaffAccount(req: Request, res: Response) {
    const { username, email, password, gender, slackId } = req.body

    const fields = ['email', 'password', 'username', 'gender', 'slackId']

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
      slackId,
    }).save()

    delete data.password
    return res.status(StatusCodes.CREATED).json(data)
  }

  async editStaffAccount(req: Request, res: Response) {
    const { username, gender, slackId } = req.body
    const staffId = parseInt(req.params.id)

    const fields = ['username', 'gender', 'slackId']

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
    user.slackId = slackId
    await user.save()

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
    })
  }

  async assignToMaster(req: Request, res: Response) {
    const staffId = parseInt(req.params.staffId)

    // Check staff is existed
    const staff = await User.findOne({
      relations: ['role'],
      where: {
        id: staffId,
        role: {
          name: Roles.Staff, // Role must be staff
        },
      },
    })

    // Return 404 http if staff not found
    if (staff === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Staff not found', statusCode: StatusCodes.NOT_FOUND })
    }

    // Get manager role
    const masterRole = await Role.findOne({
      where: {
        name: Roles.Master,
      },
    })

    // assign staff to master
    staff.role = masterRole
    await staff.save()

    return res.status(StatusCodes.OK).json({
      message: 'Assign to master successfully',
      statusCode: StatusCodes.OK,
    })
  }
}
