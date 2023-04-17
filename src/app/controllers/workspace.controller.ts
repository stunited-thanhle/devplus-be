import { Workspace } from '@entities/workspace.entity'
import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { StatusCodes } from 'http-status-codes'
import { ErrorBody } from '@shared/interface/errorInterface'
import { workspaceStatus } from '@shared/enums'

export class WorkspaceController {
  async createWorkspace(req: Request, res: Response) {
    const { body } = req
    const fields = ['name']
    const error = ValidateHelper.validate(fields, body)
    if (error.length) {
      const response: ErrorBody = {
        message: error,
        statusCode: StatusCodes.BAD_REQUEST,
      }
      return res.status(StatusCodes.BAD_REQUEST).json(response)
    }
    const result = await Workspace.create({ name: body.name }).save()
    return res.status(StatusCodes.OK).json(result)
  }
  async readWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const result = await Workspace.findOneBy({ id: parseInt(id) })
    return res.status(StatusCodes.OK).json(result)
  }

  async readLstWorkspace(req: Request, res: Response) {
    const result = await Workspace.find()
    return res.status(StatusCodes.OK).json(result)
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
}
