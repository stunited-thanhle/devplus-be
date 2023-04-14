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
<<<<<<< HEAD
      .route('/approve')
      // .all(authentication)
      .post(this.requestDayoffController.approveRequest)
=======
      .route('/:id')
      .all(authentication)
      .put(this.requestDayoffController.updateRequestApproval)

    this.router
      .route('/:id/status/approve')
      .all(authentication, authorization([Roles.Master]))
      .put(this.managerController.approveRequest)
>>>>>>> 3f12e7e (feat: change role user)
  }
}

export const requestDayOffRoute = new RequestDayOffRoute()
