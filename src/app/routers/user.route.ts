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
    this.router
      .route('/all')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.usersController.getAllUsers)

    this.router.route('/').post(this.usersController.getUsers)

    this.router
      .route('/manager-role')
      .all(authentication, authorization([Roles.Admin]))
      .get(this.usersController.getMangerUsers)

    this.router
      .route('/groups/:groupId/user-not-in-group')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.usersController.getUserNotInGroup)

    this.router
      .route('/:userId/roles')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .put(this.managerController.updateRole)

    //Route @Get Detail user's profile
    this.router
      .route('/:userId/profiles')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.usersController.getDetailUserProfile)

    this.router
      .route('/:userId/workspaces/:workSpaceId/groups')
      .all(authentication)
      .get(this.usersController.getUserGroups)

    this.router
      .route('/workspaces/:workspaceId/groups')
      .all(authentication)
      .get(this.usersController.getUserGroups)
  }
}

export const usersRoute = new UsersRoute()
