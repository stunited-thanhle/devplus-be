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
      .all(
        authentication,
        authorization([Roles.Admin, Roles.Manager, Roles.Master]),
      )
      .get(this.staffController.getListStaff)

    this.router
      .route('/')
      .all(authentication, authorization([Roles.Manager]))
      .post(this.staffController.createStaffAccount)

    this.router
      .route('/:id')
      .all(authentication, authorization([Roles.Manager]))
      .put(this.staffController.editStaffAccount)

    this.router
      .route('/:staffId/assign-to-master')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .patch(this.staffController.assignToMaster)
  }
}

export const staffsRoute = new StaffsRoute()
