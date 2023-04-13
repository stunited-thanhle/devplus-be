import { GroupMemberController } from '@controllers/group.controlller'
import { Roles } from '@shared/enums'
import { authentication, authorization } from '@shared/middleware'
import { Router } from 'express'

class GroupMemberRoute {
  public path = '/groups'
  public router = Router()

  private groupMemberController: GroupMemberController

  constructor() {
    this.groupMemberController = new GroupMemberController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .route('/')
      .all(authentication, authorization([Roles.Manager]))
      .get(this.groupMemberController.listGroups)
      .post(this.groupMemberController.createGroupMember)

    this.router.route('/users').get(this.groupMemberController.listGroupByUser)

    this.router
      .route('/:groupId')
      .all(authentication, authorization([Roles.Manager]))
      .get(this.groupMemberController.groupDetail)
  }
}

export const groupMemberRoute = new GroupMemberRoute()
