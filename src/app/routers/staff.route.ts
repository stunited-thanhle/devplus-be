import { Router } from 'express'
import { StaffController } from '@controllers/staff.controller'
import { authentication, authorization } from '@shared/middleware'
import { Roles } from '@shared/enums'
class StaffsRoute {
  public path = '/staffs'
  public router = Router()

  private staffController: StaffController

  constructor() {
    this.staffController = new StaffController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .route('/')
      .all(authentication, authorization([Roles.Manager]))
      .post(this.staffController.createStaffAccount)

    this.router
      .route('/:id')
      .all(authentication, authorization([Roles.Manager]))
      .put(this.staffController.editStaffAccount)
  }
}

export const staffsRoute = new StaffsRoute()
