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

@Entity({ name: 'request_approves' })
export class RequestAppove extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'status' })
  status: boolean

  @ManyToOne(() => User, (user) => user.requestApproves)
  user: User

  @ManyToOne(() => Request, (request) => request.requestApproves)
  request: Request

  @ManyToOne(() => Group, (request) => request.requestApproves)
  group: Group
}
