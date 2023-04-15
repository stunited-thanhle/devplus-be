import { Router } from 'express'
import { UsersController } from '@app/controllers/user.controller'
import { authentication, authorization } from '@shared/middleware'
import { Roles } from '@shared/enums'
import { ManagerController } from '@controllers/manager.controller'

class UsersRoute {
  public path = '/users'
  public router = Router()

  private usersController: UsersController
  private managerController: ManagerController

  constructor() {
    this.usersController = new UsersController()
    this.managerController = new ManagerController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.route('/login').post(this.usersController.create)
    this.router.route('/').get(this.usersController.getUsers)

    this.router
      .route('/')
      // .all(authentication, authorization([Roles.Admin]))
      .post(this.usersController.getUsers)
    // this.router.route('/:id').get()

    this.router
      .route('/:userId/roles')
      .all(authentication, authorization([Roles.Manager]))
      .put(this.managerController.updateRole)

    this.router
      .route('/:userId/requests')
      .all(authentication)
      .get(this.usersController.getUserRequests)
  }
}

export const usersRoute = new UsersRoute()
