import { Router } from 'express'
import { StaffController } from '@controllers/staff.controller'

class StaffsRoute {
  public path = '/staffs'
  public router = Router()

  private staffController: StaffController

  constructor() {
    this.staffController = new StaffController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.route('/').post(this.staffController.createStaffAccount)
  }
}

export const staffsRoute = new StaffsRoute()
