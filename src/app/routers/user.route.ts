import { Router } from 'express'
import { UsersController } from '@app/controllers/user.controller'
import { authentication } from '@shared/middleware'

class UsersRoute {
  public path = '/users'
  public router = Router()

  private usersController: UsersController

  constructor() {
    this.usersController = new UsersController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.route('/login').post(this.usersController.create)
    this.router
      .route('/')
      .all(authentication)
      .get(this.usersController.getUsers)
    // this.router.route('/:id').get()
  }
}

export const usersRoute = new UsersRoute()
