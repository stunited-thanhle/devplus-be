import { Workspace } from '@entities/workspace.entity'
import { Request, Response } from 'express'
import * as ValidateHelper from '@shared/helper'
import { StatusCodes } from 'http-status-codes'

export class WorkspaceController {
  async createWorkspace(req: Request, res: Response) {
    const { body } = req
    const fields = ['name']
    const error = ValidateHelper.validate(fields, body)
    if (error.length)
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: error[0] })
    const result = await Workspace.create({ name: body.name }).save()
    return res.status(200).json(result)
  }
  async readWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const result = await Workspace.findOneBy({ id: parseInt(id) })
    return res.status(200).json(result)
  }
  async readLstWorkspace(req: Request, res: Response) {
    const result = await Workspace.find()
    return res.status(200).json(result)
  }
  async updateWorkspace(req: Request, res: Response) {
    const { body } = req
    const fields = ['name']
    const error = ValidateHelper.validate(fields, body)
    if (error.length)
      return res.status(StatusCodes.BAD_REQUEST).json({ msg: error[0] })
    const target = await Workspace.findOneBy({ id: body.id })
    if (!target)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Workspace is not exist' })
    target.name = body.name
    await target.save()
    return res.status(200).end()
  }
  async deleteWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const target = await Workspace.findOneBy({ id: parseInt(id) })
    if (!target)
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: 'Workspace is not exist' })
    await Workspace.remove(target)
    return res.status(200).end()
  }
}
