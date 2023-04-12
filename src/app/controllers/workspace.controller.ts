import { Workspace } from '@entities/workspace.entity'
import { Request, Response } from 'express'

export class WorkspaceController {
  async createWorkspace(req: Request, res: Response) {
    const { body } = req
    const result = await Workspace.create({ name: body.name }).save()
    return res.status(200).json(result)
  }
  async readWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const result = await Workspace.findOneBy({ id: parseInt(id) })
    return res.status(200).json(result)
  }
  async readLstWorkspace(req: Request, res: Response) {
    const { sort } = req.query
    const result = await Workspace.find({})
    return res.status(200).json(result)
  }
  async updateWorkspace(req: Request, res: Response) {
    const { body } = req
    const target = await Workspace.findOneBy({ id: body.id })
    target.name = body.name
    await target.save()
    return res.status(200).end()
  }
  async deleteWorkspace(req: Request, res: Response) {
    const { id } = req.params
    const target = await Workspace.findOneBy({ id: parseInt(id) })
    await Workspace.remove(target)
    return res.status(200).end()
  }
}
