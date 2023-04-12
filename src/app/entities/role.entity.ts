import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { User } from './user.entity'

enum RoleEnum {
  Admin = 'admin',
  Manager = 'manager',
  Master = 'master',
  Staff = 'staff',
}
@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'enum',
    enum: RoleEnum,
    default: RoleEnum.Staff,
  })
  name: RoleEnum

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @OneToMany(() => User, (user) => user.role)
  users: User[]
}
