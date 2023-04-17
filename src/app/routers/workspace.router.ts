import { Router } from 'express'
import { WorkspaceController } from '@controllers/workspace.controller'
import { authentication, authorization } from '@shared/middleware'
import { Roles } from '@shared/enums'

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
      .route('/')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.workspaceController.readLstWorkspace)

    this.router
      .route('/')
      .all(authentication, authorization([Roles.Admin]))
      .post(this.workspaceController.createWorkspace)

    this.router
      .route('/:id')
      .all(authentication, authorization([Roles.Admin]))
      .get(this.workspaceController.readWorkspace)
      .patch(this.workspaceController.updateWorkspace)
      .delete(this.workspaceController.deleteWorkspace)
  }
}

export const workspaceRoute = new WorkspaceRoute()
