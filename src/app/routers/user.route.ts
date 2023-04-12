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
    this.router.route('/login').post(this.usersController.login)
    this.router.route('/').get(this.usersController.getUsers)
    // this.router.route('/:id').get()
  }
}

export const usersRoute = new UsersRoute()