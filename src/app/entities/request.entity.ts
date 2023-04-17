import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm'
import { RequestAppove } from './requestApprove.entity'
import { TypeRequestEnums } from '@shared/enums'
import { User } from './user.entity'
import { DayOff } from './dayoff.entity'
@Entity({ name: 'requests' })
export class Request extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'from' })
  from: Date

  @Column({ name: 'to' })
  to: Date

  @Column({ name: 'reason' })
  reason: string

  @Column({
    name: 'typeRequest',
    enum: TypeRequestEnums,
    default: TypeRequestEnums.DAY_OFF,
  })
  typeRequest: TypeRequestEnums

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @OneToMany(() => RequestAppove, (requestApprove) => requestApprove.request)
  requestApproves: RequestAppove[]

  @ManyToOne(() => User, (user) => user.requests)
  user: User

  @OneToMany(() => DayOff, (dayoff) => dayoff.request)
  dayoffs: DayOff[]
}
