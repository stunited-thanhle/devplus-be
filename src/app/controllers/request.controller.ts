/* eslint-disable prettier/prettier */
import { Group } from '@entities/group.entity'
import { Request as RequestEntity } from '@entities/request.entity'
import { RequestAppove } from '@entities/requestApprove.entity'
import { User } from '@entities/user.entity'

import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { Roles, StatusApproval, TypeRequestEnums } from '@shared/enums'
import { In } from 'typeorm'
import http from 'https'
import { slackNoti } from '@shared/templates/slackNotification'

export class RequestDayOffController {
  async getRequests(req: Request, res: Response) {
    const data = await RequestEntity.find({
      relations: ['requestApproves'],
    })
    return res.status(StatusCodes.OK).json(data)
  }

  async createRequest(req: Request, res: Response) {
    const user = await User.findOne({
      where: {
        id: 1,
      },
    })
    const data = RequestEntity.create({
      from: '2023-01-02',
      to: '2023-01-05',
      reason: 'sick',
      typeRequest: TypeRequestEnums.WFH,
      user: user,
    }).save()
    const postData = slackNoti(1)

    const options = {
      hostname: 'slack.com',
      port: 443,
      path: '/api/chat.postMessage',
      method: 'POST',
      headers: {
        Accept: '*',
        'Content-Type': 'application/json',
        Authorization:
          'Bearer xoxb-5114905068561-5111456359780-kzQGSTn3V7Zsg2cK80kuKJOD',
      },
    }

    const rq = http.request(options, (res) => {
      res.on('data', (data) => {
        console.log(data.toString())
      })
    })
    req.on('error', (error) => {
      console.error(error)
    })

    rq.write(postData)
    rq.end()

    return res.status(200).json({ data, message: 'ok' })
  }

  async findRequest(req: Request, res: Response) {
    const rq = await RequestEntity.findOne({
      where: {
        id: 1,
      },
      relations: ['user.groups'],
    })

    return res.status(200).json({ rq, message: 'ok' })
  }

  async approveRequest(req: Request, res: Response) {
    const { requestId, statusApprove } = req.body

    const request = await RequestEntity.findOne({
      where: {
        id: requestId,
      },
      relations: ['user'],
    })

    const userRequestId = request.user.id

    const user = await User.findOne({
      where: {
        id: userRequestId,
      },
    })

    // Lay tat ca group cua user gui request
    const groupRequestByUser = (
      await User.findOne({
        where: {
          id: userRequestId,
        },
        relations: ['groups'],
      })
    ).groups.map((item) => item.id)

    // check thang master neu master khong thuoc group cua user gui request thi return 400
    const group = await Group.find({
      where: {
        users: {
          id: 8,
        },
        id: In(groupRequestByUser),
      },
    })

    console.log(group)

    if (group.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Error' })
    }

    await RequestAppove.create({
      status: statusApprove,
      request: request,
      user: user,
    }).save()

    //Lay tat ca master cua group userid nam trong do
    const masters = (
      await User.find({
        where: {
          groups: {
            id: In(groupRequestByUser),
          },
          role: {
            name: Roles.Master,
          },
        },
      })
    ).map((item) => item.id)

    const aa = await RequestAppove.findAndCount({
      where: {
        request: {
          id: request.id,
        },
        status: StatusApproval.ACCEPT,
      },
    })

    if (
      aa[0].some((item) => item.status !== StatusApproval.REJECT) &&
      aa[1] === masters.length
    ) {
      console.log('Create Dayoff')
    }

    return res.status(200).json({ message: 'Approve successfully' })
  }
}
