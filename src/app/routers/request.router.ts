import { Router } from 'express'
import { RequestDayOffController } from '@controllers/request.controller'
import { authentication, authorization } from '@shared/middleware'
import { ManagerController } from '@controllers/manager.controller'
import { Roles } from '@shared/enums'
class RequestDayOffRoute {
  public path = '/requests'
  public router = Router()

  private requestDayoffController: RequestDayOffController
  private readonly managerController: ManagerController

  constructor() {
    this.requestDayoffController = new RequestDayOffController()
    this.managerController = new ManagerController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .route('/')
      // .all(authentication)
      .get(this.requestDayoffController.findRequest)
    this.router
      .route('/')
      // .all(authentication)
      .post(this.requestDayoffController.createRequest)
    this.router
      .route('/approve')
      // .all(authentication)
      .post(this.requestDayoffController.approveRequest)

    this.router
      .route('/:requestId')
      .all(authentication)
      .patch(this.requestDayoffController.editRequest)
  }
}

export const requestDayOffRoute = new RequestDayOffRoute()
