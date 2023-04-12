import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm'
import { RequestAppove } from './requestApprove.entity'

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

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @OneToMany(() => RequestAppove, (requestApprove) => requestApprove.request)
  requestApproves: RequestAppove[]
}
