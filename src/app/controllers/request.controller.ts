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

    // const newRequest = new RequestDayOff()
    // newRequest.from = from
    // newRequest.to = to
    // newRequest.reason = reason
    // return res.status(200).json('OK')

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

    // const data = RequestAppove.create({
    //   status: true,
    //   group: group,
    // })

    // const newRequest = new RequestDayOff()
    // newRequest.from = from
    // newRequest.to = to
    // newRequest.reason = reason
    // return res.status(200).json('OK')

    return res.status(201).json(data)
  }
}
