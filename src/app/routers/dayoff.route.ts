import { Router } from 'express'
import { authentication, authorization } from '@shared/middleware'
import { Roles } from '@shared/enums'
import { DayOffController } from '@controllers/dayoff.controller'

class DayoffRoute {
  public path = '/requests'
  public router = Router()

  private dayoffController: DayOffController

  constructor() {
    this.dayoffController = new DayOffController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .route('/:requestId/dayoffs')
      .all(authentication)
      .get(this.dayoffController.getDayoffDetail)
  }
}

export const dayoffRoute = new DayoffRoute()
