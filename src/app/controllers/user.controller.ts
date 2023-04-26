import { Role } from '@entities/role.entity'
import { User } from '@entities/user.entity'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { Roles } from '@shared/enums'
import { RequestDayOffController } from './request.controller'
import { Group } from '@entities/group.entity'
import { Workspace } from '@entities/workspace.entity'
import dataSourceConfig from '@shared/config/data-source.config'
import { Not } from 'typeorm'

export class UsersController {
  async create(req: Request, res: Response) {
    const { email, password, username, role, gender, slackId } = req.body

    const fields = [
      'email',
      'password',
      'username',
      'role',
      'slackId',
      'gender',
    ]

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const dataToCheck = [
      { model: User, field: 'email', value: email },
      { model: User, field: 'username', value: username },
      { model: User, field: 'slackId', value: slackId },
    ]

    for (const { model, field, value } of dataToCheck) {
      const exists = await ValidateHelper.checkExistence(model, field, value)
      if (exists) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `${field} already exists`,
          statusCode: StatusCodes.BAD_REQUEST,
        })
      }
    }

    const roleData = await Role.findOne({
      where: {
        id: role,
      },
    })

    const data = await User.create({
      email,
      password,
      username,
      role: roleData,
      slackId: slackId,
      gender,
    }).save()

    return res.status(200).json(data)
  }

  async getAllUsers(req: Request, res: Response) {
    const users = await User.find({
      relations: ['role'],
    })
    return res.status(StatusCodes.OK).json(users)
  }
  async getUsers(req: Request, res: Response) {
    console.log(req.body)
    const requestController = new RequestDayOffController()
    await requestController.approveRequest(req, res)
    return 1
  }

  async getMangerUsers(req: Request, res: Response) {
    const users = await User.find({
      relations: ['role'],
      where: {
        role: {
          name: Roles.Manager,
        },
      },
    })

    return res.status(StatusCodes.OK).json(users)
  }

  async getUserGroups(req: any, res: Response) {
    const userId = req.user.id
    const workspaceId = parseInt(req.params.workspaceId)

    const workspace = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
    })

    const user = await User.findOne({
      where: {
        id: userId,
      },
    })

    if (workspace === null || user === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND })
    }

    // Check is user are existed in the workspace
    const checkUserExistedInWorkspace = await dataSourceConfig
      .getRepository(Workspace)
      .createQueryBuilder('workspaces')
      .where('workspaces.id = :workspaceId', { workspaceId: workspaceId })
      .leftJoinAndSelect('workspaces.users', 'users', 'users.id = :userId', {
        userId: userId,
      })
      .getOne()

    if (
      Array.isArray(checkUserExistedInWorkspace.users) &&
      checkUserExistedInWorkspace.users.length === 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'User not existed in the workspace',
        statusCode: StatusCodes.BAD_REQUEST,
      })
    }

    const userGroups = await Group.find({
      relations: ['workspace'],
      where: {
        users: {
          id: user.id,
        },
        workspace: {
          id: workspaceId,
        },
      },
    })

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK, userGroups })
  }

  async getUserNotInGroup(req: Request, res: Response) {
    const groupId = Number(req.params.groupId)

    const users = await dataSourceConfig
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoin(
        'group_user',
        'group_user',
        'group_user.group_id != :groupId OR group_user.group_id IS NULL',
        {
          groupId: groupId,
        },
      )
      .getMany()

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
      users: users,
    })
  }
}
