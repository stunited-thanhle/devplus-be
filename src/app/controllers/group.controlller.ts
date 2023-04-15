import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Group } from '@entities/group.entity'
import { Workspace } from '@entities/workspace.entity'
import { User } from '@entities/user.entity'

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
    const { name, workSpaceId }: { name: string; workSpaceId: number } =
      req.body

    const fields = ['name', 'workSpaceId']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // Check group name is existed
    const dataToCheck = [{ model: Group, field: 'name', value: name }]

    for (const { model, field, value } of dataToCheck) {
      const exists = await ValidateHelper.checkExistence(model, field, value)
      if (exists) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `${field} already exists`,
          statusCode: StatusCodes.BAD_REQUEST,
        })
      }
    }

    const workspace = await Workspace.findOne({
      where: {
        id: workSpaceId,
      },
    })

    if (workspace === null) {
      const response: ErrorBody = {
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND,
      }
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

    console.log(workspace)

    const data = Group.create({
      name,
      workspace,
    })

    await data.save()

    return res
      .status(StatusCodes.CREATED)
      .json({ message: 'Sucessfully', statusCode: StatusCodes.CREATED })
  }

  async assignMemberToGroup(req: Request, res: Response) {
    const { userId, groupId }: { userId: number; groupId: number } = req.body

    const existedGroup = await Group.findOne({
      where: {
        id: groupId,
      },
      relations: ['users'],
    })

    const user = await User.findOne({
      where: {
        id: userId,
      },
    })
    console.log(user)

    if (user === null || existedGroup === null) {
      const response: ErrorBody = {
        message: 'Bad request',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // assign staff to group
    existedGroup.users = [...existedGroup.users, user]
    await existedGroup.save()

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
    })
  }

  async unAssignMemberToGroup(req: Request, res: Response) {
    const { userId, groupId }: { userId: number; groupId: number } = req.body

    const existedGroup = await Group.findOne({
      where: {
        id: groupId,
      },
      relations: ['users'],
    })

    const currentUser = await User.findOne({
      where: {
        id: userId,
      },
    })

    if (currentUser === null || existedGroup === null) {
      const response: ErrorBody = {
        message: 'Bad request',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // un-assign staff to group
    existedGroup.users = existedGroup.users.filter((user) => {
      return user.id !== currentUser.id
    })

    await existedGroup.save()

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
    })
  }

  async editGroup(req: Request, res: Response) {
    const { name }: { name: string } = req.body

    const groupId = parseInt(req.params.groupId)

    const fields = ['name']

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const existedGroup = await Group.findOne({
      where: {
        id: groupId,
      },
    })

    if (existedGroup === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.BAD_REQUEST })
    }

    // Check group name is existed
    const dataToCheck = [{ model: Group, field: 'name', value: name }]

    for (const { model, field, value } of dataToCheck) {
      const exists = await ValidateHelper.checkExistence(model, field, value)
      if (exists) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `${field} already exists`,
          statusCode: StatusCodes.BAD_REQUEST,
        })
      }
    }

    // Update the group
    existedGroup.name = name
    await existedGroup.save()

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }
}