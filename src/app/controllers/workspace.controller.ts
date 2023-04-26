import { Workspace } from '@entities/workspace.entity'
import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { StatusCodes } from 'http-status-codes'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Roles, workspaceStatus } from '@shared/enums'
import { User } from '@entities/user.entity'
import dataSourceConfig from '@shared/config/data-source.config'

export class WorkspaceController {
  async createWorkspace(req: Request, res: Response) {
    const { name } = req.body
    const fields = ['name']
    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    const dataToCheck = [{ model: Workspace, field: 'name', value: name }]

    for (const { model, field, value } of dataToCheck) {
      const exists = await ValidateHelper.checkExistence(model, field, value)
      if (exists) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `${field} already exists`,
          statusCode: StatusCodes.BAD_REQUEST,
        })
      }
    }

    const result = await Workspace.create({ name }).save()

    return res.status(StatusCodes.OK).json(result)
  }
  async readWorkspace(req: Request, res: Response) {
    const workspaceId = parseInt(req.params.id)

    const result = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
      relations: ['users.role'],
    })

    if (result === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not Found', statusCode: StatusCodes.NOT_FOUND })
    }

    return res.status(StatusCodes.OK).json(result)
  }

  async readLstWorkspace(req: Request, res: Response) {
    const type = req.query.type

    if (type !== undefined && type == 'get-all') {
      const workspaces = await Workspace.find()
      return res.status(StatusCodes.OK).json(workspaces)
    }

    const workspaces = await dataSourceConfig
      .getRepository(Workspace)
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.users', 'users')
      .leftJoinAndSelect('users.role', 'role', 'role.name = :name', {
        name: Roles.Manager,
      })
      .getMany()

    return res.status(StatusCodes.OK).json(workspaces)
  }
  async updateWorkspace(req: Request, res: Response) {
    const { name, status }: { name: string; status: workspaceStatus } = req.body

    const fields = ['name', 'status']
    const workSpaceId = parseInt(req.params.id)

    const error = ValidateHelper.validate(fields, req.body)

    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }
    const target = await Workspace.findOneBy({ id: workSpaceId })

    if (!target) {
      const response: ErrorBody = {
        message: 'Workspace is not exist',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    target.name = name
    target.status = status
    await target.save()

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
    })
  }
  async deleteWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const target = await Workspace.findOneBy({ id: parseInt(id) })
    if (!target) {
      const response: ErrorBody = {
        message: 'Workspace is not exist',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }
    await Workspace.remove(target)
    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
    })
  }

  async assignUserToWorkSpace(req: Request, res: Response) {
    const { userId }: { userId: number } = req.body
    const workspaceId = parseInt(req.params.workspaceId)

    const user = await User.findOne({
      where: {
        id: userId,
      },
    })

    const existedWorkspace = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
      relations: ['users'],
    })

    // return 404 if workspace not found
    if (existedWorkspace === null || user === null) {
      const response: ErrorBody = {
        message: 'Not found',
        statusCode: StatusCodes.NOT_FOUND,
      }

      return res.status(StatusCodes.NOT_FOUND).json(response)
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
      checkUserExistedInWorkspace.users.length !== 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'User have already existed in the current workspace',
        statusCode: StatusCodes.BAD_REQUEST,
      })
    }

    existedWorkspace.users = [...existedWorkspace.users, user]
    await existedWorkspace.save()

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }

  async unAssignUserFromWorkSpace(req: Request, res: Response) {
    const { userId }: { userId: number } = req.body
    const workspaceId = parseInt(req.params.workspaceId)

    const user = await User.findOne({
      where: {
        id: userId,
      },
    })

    const existedWorkspace = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
      relations: ['users'],
    })

    // return 404 if workspace not found
    if (existedWorkspace === null || user === null) {
      const response: ErrorBody = {
        message: 'Not found',
        statusCode: StatusCodes.NOT_FOUND,
      }

      return res.status(StatusCodes.NOT_FOUND).json(response)
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
        message: 'User have not been assign to workspace before',
        statusCode: StatusCodes.BAD_REQUEST,
      })
    }

    // Remove the user where userId in list workspace users array
    existedWorkspace.users = existedWorkspace.users.filter((user) => {
      return user.id !== userId
    })

    await existedWorkspace.save()

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }
}
