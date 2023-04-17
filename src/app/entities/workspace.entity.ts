import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Group } from './group.entity'
import { workspaceStatus } from '@shared/enums'

@Entity({ name: 'workspaces' })
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name' })
  name: string

  @Column({
    name: 'status',
    enum: workspaceStatus,
    default: workspaceStatus.ACTIVE,
  })
  status: workspaceStatus

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @ManyToMany(() => User)
  @JoinTable()
  users: User[]

  @OneToMany(() => Group, (group) => group.workspace)
  groups: Group[]
}
