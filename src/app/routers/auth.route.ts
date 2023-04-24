import { AuthController } from '@controllers/auth.controller'
import { Roles } from '@shared/enums'
import { authentication, authorization } from '@shared/middleware'
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
    this.router
      .route('/roles')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.authController.getRoles)

    this.router
      .route('/reset-password')
      .all(authentication)
      .put(this.authController.resetPassword)
  }
}
export const authRoute = new AuthRoute()
