import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { Role } from './role.entity'
import { RequestAppove } from './requestApprove.entity'

export type genderArray = '0' | '1' | '2'
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false, type: 'varchar', length: 50 })
  username: string

  @Column({ nullable: false, type: 'varchar', length: 250 })
  email: string

  @Column({
    type: 'enum',
    enum: ['0', '1', '2'],
    default: '2',
  })
  gender: genderArray

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @OneToOne(() => Role)
  @JoinColumn()
  role: Role

  @OneToMany(() => RequestAppove, (requestApprove) => requestApprove.user)
  requestApproves: RequestAppove[]
}
