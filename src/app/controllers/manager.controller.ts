import { Role } from '@entities/role.entity'
import { User } from '@entities/user.entity'
import { Roles } from '@shared/enums'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Not } from 'typeorm'
import * as ValidateHelper from '@shared/helper'

export class ManagerController {
  async updateRole(req: Request, res: Response) {
    const { newRole } = req.body

    const fields = ['newRole']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length || !Object.values(Roles).includes(newRole)) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const userId = parseInt(req.params.userId)

    const user = await User.findOne({
      relations: ['role'],
      where: {
        id: userId,
        role: {
          name: Not(Roles.Admin),
        },
      },
    })

    const userRole = await Role.findOne({
      where: {
        name: newRole,
      },
    })

    if (user === null || userRole === null || userRole?.name === Roles.Admin) {
      const response: ErrorBody = {
        message: 'Bad Request',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    user.role = userRole
    await user.save()

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }

  async approveRequest(req: Request, res: Response) {
    const requestId = parseInt(req.params.requestId)

    console.log('requesetID', requestId)
    return res.status(StatusCodes.OK).json('OK')
  }
}
