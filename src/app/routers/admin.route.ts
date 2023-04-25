import { Router } from 'express'
import { AdminController } from '@controllers/admin.controller'
import { authentication, authorization } from '@shared/middleware'
import { Roles } from '@shared/enums'

class AdminRoute {
  public path = '/admin'
  public router = Router()

  private adminController: AdminController

  constructor() {
    this.adminController = new AdminController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.use(authentication, authorization([Roles.Admin]))
    this.router
      .route('/manager/:id')
      .get(this.adminController.getManager)
      .patch(this.adminController.updateManager)
      .delete(this.adminController.deleteManager)

    this.router
      .route('/manager')
      .get(this.adminController.getLstManager)
      .post(this.adminController.createManager)

    this.router
      .route('/change-user-password')
      .all(authentication)
      .put(this.adminController.changeUserPassword)
  }
}

export const adminRoute = new AdminRoute()
