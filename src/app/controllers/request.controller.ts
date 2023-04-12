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
    const { from, to, reason, groupId, userId } = req.body
    const fields = ['from', 'to', 'reason', 'groupId', 'userId']

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

  async updateRequestApproval(req: Request, res: Response) {
    const { requestId, from, to, reason } = req.body

    const fields = ['requestId', 'to', 'from', 'reason']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const data = await RequestDayOff.findOneBy({
      id: requestId,
    })

    data.from = from
    data.reason = reason
    data.to = to
    await data.save()

    return res.status(StatusCodes.OK).json('Successfully')
  }
}
