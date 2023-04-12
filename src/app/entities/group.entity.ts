import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { User } from './user.entity'
import { Workspace } from './workspace.entity'
import { RequestAppove } from './requestApprove.entity'

@Entity({ name: 'groups' })
export class Group extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'name' })
  name: string

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @ManyToMany(() => User)
  @JoinTable()
  users: User[]

  @ManyToOne(() => Workspace, (workspace) => workspace.groups)
  workspace: Workspace

  @OneToMany(() => RequestAppove, (requestApprove) => requestApprove.group)
  requestApproves: RequestAppove[]
}
