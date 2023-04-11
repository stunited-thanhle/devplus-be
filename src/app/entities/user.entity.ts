import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm'

export type genderArray = '0' | '1' | '2'
@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: false, type: 'varchar', length: 50 })
  username: string

  @Column({ nullable: false, type: 'varchar', length: 250 })
  email: string

  @Column({ nullable: true, name: 'birthday', type: 'date' })
  birthday: Date

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
}
