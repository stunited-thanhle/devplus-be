import { Group } from '@entities/group.entity'
import { Request as RequestDayOff } from '@entities/request.entity'
import { RequestAppove } from '@entities/requestApprove.entity'
import { User } from '@entities/user.entity'

import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'

export class RequestDayOffController {
  async getRequests(req: Request, res: Response) {
    const data = await RequestDayOff.find({
      relations: ['requestApproves'],
    })
    return res.status(StatusCodes.OK).json(data)
  }

  async createDayOff(req: Request, res: Response) {
    const { from, to, reason, groupId, userId, typeRequest } = req.body
    const fields = ['from', 'to', 'reason', 'groupId', 'userId', 'typeRequest']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const newRequestDayOff = await RequestDayOff.create({
      from,
      to,
      reason,
      typeRequest,
    }).save()

    const user = await User.findOne({
      where: {
        id: userId,
      },
    })
    const group = await Group.findOne({
      where: {
        id: groupId,
      },
    })

    const newRequest = await RequestDayOff.findOne({
      where: {
        id: newRequestDayOff.id,
      },
    })

    const data = await RequestAppove.create({
      user: user,
      group: group,
      request: newRequest,
    }).save()

    console.log('data', data)

    return res.status(201).json({ message: 'Successfully' })
  }

  async updateRequestApproval(req: any, res: Response) {
    console.log('req user: ', req.user)
    const { from, to, reason, typeRequest } = req.body

    const requestId = parseInt(req.params.id)

    const fields = ['to', 'from', 'reason', 'typeRequest']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const data = await RequestDayOff.findOne({
      where: {
        id: requestId,
      },
    })
    if (data === null) {
      const response: ErrorBody = {
        message: 'Not found',
        statusCode: StatusCodes.NOT_FOUND,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const requestApproveEntity = await RequestAppove.findOne({
      where: { id: requestId },
      relations: ['user'],
    })

    // Check the current user is own
    if (requestApproveEntity.user.id !== req.user.id) {
      const response: ErrorBody = {
        message: 'You not have permission',
        statusCode: StatusCodes.FORBIDDEN,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    data.from = from
    data.reason = reason
    data.to = to
    data.typeRequest = typeRequest
    await data.save()

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }
}
