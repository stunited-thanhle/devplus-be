import { Router } from 'express'
import { RequestDayOffController } from '@controllers/request.controller'

class RequestDayOffRoute {
  public path = '/requests'
  public router = Router()

  private requestDayoffController: RequestDayOffController

  constructor() {
    this.requestDayoffController = new RequestDayOffController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.route('/').get(this.requestDayoffController.getRequests)

    this.router.route('/').post(this.requestDayoffController.createDayOff)

    this.router
      .route('/:id')
      .put(this.requestDayoffController.updateRequestApproval)
  }
}

export const requestDayOffRoute = new RequestDayOffRoute()
