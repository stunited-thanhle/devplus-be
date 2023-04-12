import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Request } from './request.entity'
import { Group } from './group.entity'
import { StatusApproval } from '@shared/enums'

@Entity({ name: 'request_approves' })
export class RequestAppove extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'enum',
    enum: StatusApproval,
    name: 'status',
    default: StatusApproval.PENDING,
  })
  status: StatusApproval

  @ManyToOne(() => User, (user) => user.requestApproves)
  user: User

  @ManyToOne(() => Request, (request) => request.requestApproves)
  request: Request

  @ManyToOne(() => Group, (request) => request.requestApproves)
  group: Group
}
