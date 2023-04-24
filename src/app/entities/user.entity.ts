import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  BeforeInsert,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm'
import { Role } from './role.entity'
import { RequestAppove } from './requestApprove.entity'
import * as bcrypt from 'bcryptjs'
import * as jwt from 'jsonwebtoken'
import { Request } from './request.entity'
import { Group } from './group.entity'
import { GenderEnums } from '@shared/enums'
import { Workspace } from './workspace.entity'

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false, type: 'varchar', length: 50 })
  username: string

  @Column({ nullable: false, type: 'varchar', length: 250 })
  email: string

  @Column('text')
  password: string

  @Column({ name: 'slackId' })
  slackId: string

  @Column({
    name: 'gender',
    type: 'enum',
    enum: GenderEnums,
    nullable: true,
  })
  gender: GenderEnums

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @ManyToOne(() => Role, (role) => role.users)
  role: Role

  @OneToMany(() => RequestAppove, (requestApprove) => requestApprove.user)
  requestApproves: RequestAppove[]

  @OneToMany(() => Request, (request) => request.user)
  requests: Request[]

  @ManyToMany(() => Group, (group) => group.users)
  @JoinTable({
    name: 'group_user',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' },
  })
  groups: Group[]

  @ManyToMany(() => Workspace, (workspace) => workspace.users)
  workspaces: Workspace[]

  @BeforeInsert()
  async hasPassword() {
    this.password = await bcrypt.hash(this.password, 10)
  }
  async comparePassword(attempt: string) {
    return await bcrypt.compare(attempt, this.password)
  }
  get token() {
    const { id, username, role, slackId } = this
    return jwt.sign(
      {
        id,
        username,
        role: role.name,
        slackId,
      },
      process.env.SECRET,
      { expiresIn: '7d' },
    )
  }
}
