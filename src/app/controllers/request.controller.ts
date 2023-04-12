import { Request as RequestDayOff } from '@entities/request.entity'
import { RequestAppove } from '@entities/requestApprove.entity'
import { Request, Response } from 'express'
import dataSource from '@shared/config/data-source.config'
import { User } from '@entities/user.entity'
import { Repository } from 'typeorm'
import { Group } from '@entities/group.entity'

export class RequestDayOffController {
  async createDayOff(req: Request, res: Response) {
    const { from, to, reason, groupId, userId } = req.body

    const result = await RequestDayOff.create({
      from,
      to,
      reason,
    }).save()

    const user = await User.find({
      where: {
        id: userId,
      },
    })
    const group = await Group.find({
      where: {
        id: groupId,
      },
    })

    const data = RequestAppove.create({
      status: true,
      user: user[0],
      group: group[0],
    })

    return res.status(201).json(result)
  }

  async createRequestApproval(req: Request, res: Response) {
    const user = await User.find({
      where: {
        id: 1,
      },
    })
    const group = await Group.find({
      where: {
        id: 1,
      },
    })

    const data = RequestAppove.create({
      status: true,
      user: user[0],
      group: group[0],
    })

    return res.status(201).json(data)
  }

  async updateRequestApproval(req: Request, res: Response) {
    const { requestId, from, to, reason } = req.body

    res.json(req.params.id)
  }
}
