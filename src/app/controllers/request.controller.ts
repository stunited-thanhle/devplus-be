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
import { slackNoti, slackNotiDayoff } from '@shared/templates/slackNotification'
import { DayOff } from '@entities/dayoff.entity'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import dataSourceConfig from '@shared/config/data-source.config'

const sendMessageToDayoff = (
  options: any,
  request: RequestEntity,
  user: User,
) => {
  const postData = slackNotiDayoff(
    user.username,
    request.typeRequest,
    request.from,
    request.to,
    request.quantity,
    request.reason,
  )
  const rq = http.request(options, (res) => {
    res.on('data', (data) => {
      console.log(data.toString())
    })
  })
  rq.on('error', (error) => {
    console.error(error)
  })

  rq.write(postData)
  rq.end()

  return true
}
export class RequestDayOffController {
  async getRequests(req: any, res: Response) {
    const currentUserId = req.user.id

    const currentUser = await User.findOne({
      relations: ['role'],
      where: {
        id: currentUserId,
      },
    })

    if (currentUser.role.name === Roles.Staff) {
      // lay toan bo group cua master
      const requests = await RequestEntity.find({
        where: {
          user: {
            id: currentUserId,
          },
        },
      })

      return res.status(StatusCodes.OK).json(requests)
    }

    if (currentUser.role.name === Roles.Master) {
      // lay toan bo group cua master
      const groupRequestByUser = (
        await User.findOne({
          where: {
            id: currentUserId,
          },
          relations: ['groups'],
        })
      ).groups.map((item) => item.id)

      // get all the user in all gruops of master
      const usersInGroups = await User.find({
        relations: ['groups'],
        where: {
          groups: {
            id: In(groupRequestByUser),
          },
        },
      })

      const requests = await RequestEntity.find({
        relations: ['user', 'requestApproves'],
        where: {
          user: {
            id: In(usersInGroups),
          },
        },
      })

      return res.status(StatusCodes.OK).json(requests)
    }

    const requests = await RequestEntity.find({
      relations: ['user', 'requestApproves'],
    })

    return res.status(StatusCodes.OK).json(requests)
  }

  async createRequest(req: Request, res: Response) {
    try {
      const { userRequestId, from, to, reason, typeRequest, quantity } =
        req.body

      const fields = [
        'userRequestId',
        'from',
        'to',
        'reason',
        'typeRequest',
        'quantity',
      ]
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
          id: userRequestId,
        },
      })

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'User not found' })
      }

      const data = await RequestEntity.create({
        from,
        to,
        reason,
        typeRequest,
        user: user,
        quantity,
      }).save()

      await DayOff.create({
        action: 'Request',
        name: user.username,
        request: data,
        detail: {
          name: user.username,
          value: 'requested',
          From: from,
          To: to,
          Type: typeRequest,
          Reason: reason,
          quantity,
        },
      }).save()

      const groupRequestByUser = (
        await User.findOne({
          where: {
            id: userRequestId,
          },
          relations: ['groups'],
        })
      ).groups.map((item) => item.id)

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
      ).map((item) => item)

      const options = {
        hostname: 'slack.com',
        port: 443,
        path: '/api/chat.postMessage',
        method: 'POST',
        headers: {
          Accept: '*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
        },
      }

      sendMessageToDayoff(options, data, user)

      masters.forEach((item) => {
        const postData = slackNoti(item, data)
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
      })

      return res.status(200).json({ data, message: 'ok' })
    } catch (error) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error' })
    }
  }

  async findRequest(req: Request, res: Response) {
    const requestId = parseInt(req.params.requestId)

    const request = await RequestEntity.findOne({
      where: {
        id: requestId,
      },
      relations: ['dayoffs'],
    })

    if (request === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.NOT_FOUND })
    }

    return res.status(StatusCodes.OK).json(request)
  }

  async approveRequest(req: Request, res: Response) {
    const payload = req.body.payload ? JSON.parse(req.body.payload) : null

    const { requestId, statusApprove, slackId } = req.body

    const request = await RequestEntity.findOne({
      where: {
        id: requestId || payload.callback_id,
      },
      relations: ['user'],
    })

    const userRequestId = request?.user.id

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

    //Neu master khong thuoc group user gui request thi return loi
    const group = await Group.find({
      where: {
        users: {
          slackId: slackId || payload?.user.id,
        },
        id: In(groupRequestByUser),
      },
    })

    console.log('group: ', group)

    if (!group.length) {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: 'q' })
    }

    if (new Date(request.from) > new Date()) {
      if (payload) return 'Request is expired'
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: 'Request is expired' })
    }
    await RequestAppove.create({
      status: statusApprove || payload.actions[0].value,
      request: request,
      user: user,
    }).save()

    //Create history
    await DayOff.create({
      action: statusApprove || payload.actions[0].value,
      name: user?.username,
      request,
      detail: {
        name: user?.username,
        value: statusApprove || payload.actions[0].value,
      },
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

    // find va count so luong status cua request id
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
      await DayOff.create({
        action: 'Day off',
        name: 'Day off',
        request,
        detail: {
          value: 'Day off has been created',
        },
      }).save()
    }

    if (payload) {
      return res.status(200).json('Approve successfully')
    } else {
      return res.status(200).json({ message: 'Approve successfully' })
    }
  }

  async editRequest(req: Request, res: Response) {
    try {
      const requestId = parseInt(req.params.requestId)

      const {
        userRequestId,
        from,
        to,
        reason,
        typeRequest,
        quantity,
      }: {
        requestId: number
        userRequestId: number
        from: Date
        to: Date
        reason: string
        typeRequest: TypeRequestEnums
        quantity: number
      } = req.body

      const fields = [
        'userRequestId',
        'from',
        'to',
        'reason',
        'typeRequest',
        'quantity',
      ]
      const error = ValidateHelper.validate(fields, req.body)

      if (error.length) {
        const response: ErrorBody = {
          message: error,
          statusCode: StatusCodes.BAD_REQUEST,
        }
        return res.status(StatusCodes.BAD_REQUEST).json(response)
      }

      const data = await RequestEntity.findOne({
        relations: ['user', 'requestApproves'],
        where: {
          id: requestId,
          user: {
            id: userRequestId,
          },
        },
      })

      const user = await User.findOne({
        where: {
          id: userRequestId,
        },
      })

      if (!user) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'User not found' })
      }

      if (!data) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ message: 'Request not found' })
      }

      const a = await dataSourceConfig
        .getRepository(RequestAppove)
        .createQueryBuilder('requestApprove')
        .delete()
        .from(RequestAppove)
        .andWhere('request.id = :id', { id: 1 })
        .execute()

      console.log(a, '123')
      // update the current request
      data.from = from
      data.to = to
      data.user = user
      data.quantity = quantity
      data.typeRequest = typeRequest
      await data.save()

      // insert new dayoff history
      await DayOff.create({
        action: 'Request',
        name: user.username,
        request: data,
        detail: {
          name: user.username,
          value: 'requested',
          From: from,
          To: to,
          Type: typeRequest,
          Reason: reason,
          quantity,
        },
      }).save()

      const groupRequestByUser = (
        await User.findOne({
          where: {
            id: userRequestId,
          },
          relations: ['groups'],
        })
      ).groups.map((item) => item.id)

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
      ).map((item) => item)

      const options = {
        hostname: 'slack.com',
        port: 443,
        path: '/api/chat.postMessage',
        method: 'POST',
        headers: {
          Accept: '*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.SLACK_TOKEN}`,
        },
      }

      sendMessageToDayoff(options, data, user)

      masters.forEach((item) => {
        const postData = slackNoti(item, data)
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
      })

      return res.status(200).json({ data, message: 'ok' })
    } catch (error) {
      console.log(error)
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal Server Error' })
    }
  }
}
