import { GroupMemberController } from '@controllers/group.controlller'
import { Roles } from '@shared/enums'
import { authentication, authorization } from '@shared/middleware'
import { Router } from 'express'

class GroupMemberRoute {
  public path = '/workspaces'
  public router = Router()

  private groupMemberController: GroupMemberController

  constructor() {
    this.groupMemberController = new GroupMemberController()
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router
      .route('/list-all-groups')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.groupMemberController.getAllGroups)

    this.router
      .route('/:workspaceId/groups')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.groupMemberController.listGroups)

    this.router.route('/').post(this.groupMemberController.createGroup)

    this.router
      .route('/groups/assign-to-group')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .post(this.groupMemberController.assignMemberToGroup)

    this.router
      .route('/groups/unassign-to-group')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .post(this.groupMemberController.unAssignMemberToGroup)

    this.router
      .route('/groups/:id')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.groupMemberController.groupDetail)

    //@desc Edit the group
    //@route Put /groups/:groupId
    //@access private
    this.router
      .route('/:workspaceId/groups/:groupId')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .put(this.groupMemberController.editGroup)
      .delete(this.groupMemberController.deleteGruop)

    this.router
      .route('/:workspaceId/groups/:groupId/staffs')
      .all(authentication, authorization([Roles.Admin, Roles.Manager]))
      .get(this.groupMemberController.listStaffInGroup)
  }
}

export const groupMemberRoute = new GroupMemberRoute()
