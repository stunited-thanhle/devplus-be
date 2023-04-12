import { Router } from 'express'
import { WorkspaceController } from '@controllers/workspace.controller'

class WorkspaceRoute {
  public path = '/admin/workspace'
  public router = Router()

  private workspaceController: WorkspaceController

  constructor() {
    this.workspaceController = new WorkspaceController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .route('/:id')
      .get(this.workspaceController.readWorkspace)
      .patch(this.workspaceController.updateWorkspace)
      .delete(this.workspaceController.deleteWorkspace)

    this.router
      .route('/')
      .get(this.workspaceController.readLstWorkspace)
      .post(this.workspaceController.createWorkspace)
  }
}

export const workspaceRoute = new WorkspaceRoute()
