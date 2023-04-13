import { Router } from 'express'
import { RequestDayOffController } from '@controllers/request.controller'
import { authentication } from '@shared/middleware'

class RequestDayOffRoute {
  public path = '/requests'
  public router = Router()

  private requestDayoffController: RequestDayOffController

  constructor() {
    this.requestDayoffController = new RequestDayOffController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .route('/')
      .all(authentication)
      .get(this.requestDayoffController.getRequests)

    this.router
      .route('/')
      .all(authentication)
      .post(this.requestDayoffController.createDayOff)

    this.router
      .route('/:id')
      .all(authentication)
      .put(this.requestDayoffController.updateRequestApproval)
  }
}

export const requestDayOffRoute = new RequestDayOffRoute()
