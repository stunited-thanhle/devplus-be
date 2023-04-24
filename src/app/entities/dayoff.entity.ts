import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Request } from './request.entity'

@Entity({ name: 'dayoff' })
export class DayOff extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ name: 'action' })
  action: string

  @Column({ name: 'name' })
  name: string

  @Column('jsonb')
  detail: Record<string, unknown>

  @CreateDateColumn({ nullable: false, name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ nullable: true, name: 'updated_at' })
  updatedAt: Date

  @DeleteDateColumn({ nullable: true, name: 'deleted_at' })
  deletedAt: Date

  @ManyToOne(() => Request, (request) => request.dayoffs)
  request: Request
}
