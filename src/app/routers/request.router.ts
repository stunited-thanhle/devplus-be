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
  }
}

export const requestDayOffRoute = new RequestDayOffRoute()
