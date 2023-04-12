import { Router } from 'express'
import { UsersController } from '@app/controllers/user.controller'

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
    this.router.route('/').get(this.usersController.getUsers)
  }
}

export const usersRoute = new UsersRoute()
