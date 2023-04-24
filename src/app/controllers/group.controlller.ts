import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import * as ValidateHelper from '@shared/helper'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Group } from '@entities/group.entity'
import { Workspace } from '@entities/workspace.entity'
import { User } from '@entities/user.entity'
import { Roles, workspaceStatus } from '@shared/enums'
import dataSourceConfig from '@shared/config/data-source.config'
import { Role } from '@entities/role.entity'

export class GroupMemberController {
  async getAllGroups(req: Request, res: Response) {
    const staffRole = await Role.findOne({
      where: {
        name: Roles.Staff,
      },
    })

    const masterRole = await Role.findOne({
      where: {
        name: Roles.Master,
      },
    })

    // Groups include user with role staff
    const groups = await dataSourceConfig
      .getRepository(Group)
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.workspace', 'workspace')
      .leftJoinAndSelect('group.users', 'user', 'user.roleId = :staffRoleId', {
        staffRoleId: staffRole.id,
      })
      .orderBy('group.created_at', 'DESC')
      .addOrderBy('workspace.id')
      .getMany()

    const masterUsers = await dataSourceConfig
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.groups', 'group')
      .where('user.roleId = :masterRoleId', { masterRoleId: masterRole.id })
      .getMany()

    const groupsWithMaster = groups.map((group) => ({
      ...group,
      master: masterUsers.filter((user) =>
        user.groups.some((g) => g.id === group.id),
      ),
    }))

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
      groups: groupsWithMaster,
    })
  }

  // list all gruop by workspace
  async listGroups(req: Request, res: Response) {
    const workspaceId = parseInt(req.params.workspaceId)

    const workspace = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
    })

    if (workspace === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.NOT_FOUND })
    }

    const groups = await Group.find({
      relations: ['workspace'],
      where: {
        workspace: {
          id: workspace.id,
        },
      },
    })

    return res.status(StatusCodes.OK).json(groups)
  }

  async groupDetail(req: Request, res: Response) {
    const groupId = parseInt(req.params.id)

    const groupDetail = await Group.findOne({
      where: {
        id: groupId,
      },
      relations: ['users', 'users.role'],
    })

    const master = groupDetail.users.filter(
      (user) => user.role.name === Roles.Master,
    )

    return res.status(StatusCodes.OK).json({ ...groupDetail, masters: master })
  }

  async createGroup(req: Request, res: Response) {
    const { name, workSpaceId }: { name: string; workSpaceId: number } =
      req.body
    const fields = ['name']

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

    if (workspace === null || workspace.status === workspaceStatus.INACTIVE) {
      const response: ErrorBody = {
        message: 'Workspace not found or inactive',
        statusCode: StatusCodes.NOT_FOUND,
      }
      return res.status(StatusCodes.NOT_FOUND).json(response)
    }

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

    console.log(existedGroup)

    const user = await User.findOne({
      where: {
        id: userId,
      },
    })

    if (user === null || existedGroup === null) {
      const response: ErrorBody = {
        message: 'Bad request',
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }

    // Check is user are existed in the workspace
    const checkUserExistedInGroup = await dataSourceConfig
      .getRepository(Group)
      .createQueryBuilder('groups')
      .where('groups.id = :groupId', { groupId: groupId })
      .leftJoinAndSelect('groups.users', 'users', 'users.id = :userId', {
        userId: userId,
      })
      .getOne()

    if (
      Array.isArray(checkUserExistedInGroup?.users) &&
      checkUserExistedInGroup.users.length !== 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'User have already existed in the current group',
        statusCode: StatusCodes.BAD_REQUEST,
      })
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

    // Check is user are existed in the workspace
    const checkUserExistedInGroup = await dataSourceConfig
      .getRepository(Group)
      .createQueryBuilder('groups')
      .where('groups.id = :groupId', { groupId: groupId })
      .leftJoinAndSelect('groups.users', 'users', 'users.id = :userId', {
        userId: userId,
      })
      .getOne()

    if (
      Array.isArray(checkUserExistedInGroup?.users) &&
      checkUserExistedInGroup.users.length === 0
    ) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'User have been not assign in the current group before',
        statusCode: StatusCodes.BAD_REQUEST,
      })
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

    const workspaceId = parseInt(req.params.workspaceId)

    const groupId = parseInt(req.params.groupId)

    const workspace = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
    })

    if (workspace === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.NOT_FOUND })
    }

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

  async deleteGruop(req: Request, res: Response) {
    const workspaceId = parseInt(req.params.workspaceId)
    const groupId: number = parseInt(req.params.groupId)

    const workspace = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
    })

    if (workspace === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.NOT_FOUND })
    }

    const existedGroup = await Group.findOne({
      where: {
        id: groupId,
      },
      relations: ['users'],
    })

    existedGroup.users = []
    await existedGroup.remove()
    await existedGroup.save()

    console.log(existedGroup.users)

    return res
      .status(StatusCodes.OK)
      .json({ message: 'Successfully', statusCode: StatusCodes.OK })
  }

  async listStaffInGroup(req: Request, res: Response) {
    const groupId = parseInt(req.params.groupId)
    const workspaceId = parseInt(req.params.workspaceId)

    const workspace = await Workspace.findOne({
      where: {
        id: workspaceId,
      },
    })

    if (workspace === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.NOT_FOUND })
    }

    const staffRole = await Role.findOne({
      where: {
        name: Roles.Staff,
      },
    })

    const group = await dataSourceConfig
      .getRepository(Group)
      .createQueryBuilder('group')
      .where('group.id = :groupId', { groupId: groupId })
      .leftJoinAndSelect('group.users', 'user', 'user.roleId = :roleId', {
        roleId: staffRole.id,
      })
      .getOne()

    if (group === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.NOT_FOUND })
    }

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
      staffs: group.users,
    })
  }
}
