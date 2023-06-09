import { Router } from 'express'
import { authentication } from '@shared/middleware'
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
      .route('/dayoffs/export-dayoffs')
      .post(this.dayoffController.exportDataDayOffs)

    this.router
      .route('/:requestId/dayoffs')
      .all(authentication)
      .get(this.dayoffController.getDayoffDetail)
  }
}

export const dayoffRoute = new DayoffRoute()
