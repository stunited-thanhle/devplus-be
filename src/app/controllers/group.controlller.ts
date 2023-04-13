import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Group } from '@entities/group.entity'

export class GroupMemberController {
  async listGroups(req: Request, res: Response) {
    const listGroups = await Group.find()

    return res.status(StatusCodes.OK).json(listGroups)
  }

  async listGroupByUser(req: any, res: Response) {
    const data = await Group.find({
      relations: ['users'],
      where: {
        users: {
          id: 2,
        },
      },
    })

    return res.status(StatusCodes.OK).json(data)
  }

  async groupDetail(req: Request, res: Response) {
    const groupId = parseInt(req.params.groupId)

    const groupDetail = await Group.findOne({
      where: {
        id: groupId,
      },
      relations: ['users'],
    })

    return res.status(StatusCodes.OK).json(groupDetail)
  }

  async createGroupMember(req: Request, res: Response) {
    const { name }: { name: string } = req.body

    const fields = ['name']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const data = Group.create({
      name,
    })

    await data.save()

    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'Sucessfully', statusCode: StatusCodes.ACCEPTED })
  }
}
