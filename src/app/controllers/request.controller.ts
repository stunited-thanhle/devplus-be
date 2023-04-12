import { Group } from '@entities/group.entity'
import { Request as RequestDayOff } from '@entities/request.entity'
import { RequestAppove } from '@entities/requestApprove.entity'
import { User } from '@entities/user.entity'

import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export class RequestDayOffController {
  async getRequests(req: Request, res: Response) {
    const data = await RequestDayOff.find({
      relations: ['requestApproves'],
    })
    return res.status(StatusCodes.OK).json(data)
  }
  async createDayOff(req: Request, res: Response) {
    const { from, to, reason, groupId, userId } = req.body
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
    // const { requestId, from, to, reason } = req.body
    // res.json(req.params.id)
  }
}
