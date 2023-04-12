import { AuthController } from '@controllers/auth.controller'
import { Router } from 'express'

class AuthRoute {
  public path = '/auth'
  public router = Router()
  private authController: AuthController
  constructor() {
    this.authController = new AuthController()
    this.initializeRoutes()
  }
  private initializeRoutes() {
    this.router.route('/login').post(this.authController.login)
  }
}
export const authRoute = new AuthRoute()
