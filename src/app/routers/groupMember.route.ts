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
      .route('/assign-to-group')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .post(this.groupMemberController.assignMemberToGroup)

    this.router
      .route('/unassign-to-group')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .post(this.groupMemberController.unAssignMemberToGroup)

    this.router
      .route('/:groupId')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.groupMemberController.groupDetail)

    //@desc Edit the group
    //@route Put /groups/:groupId
    //@access private
    this.router
      .route('/:groupId')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .put(this.groupMemberController.editGroup)
      .delete(this.groupMemberController.deleteGruop)
  }
}

export const groupMemberRoute = new GroupMemberRoute()
