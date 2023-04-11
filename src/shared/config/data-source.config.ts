import { DataSource } from 'typeorm'
import * as dotenv from 'dotenv'

dotenv.config()

export default new DataSource({
  type: 'postgres',
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS + '',
  port: +process.env.DB_PORT || 5432,
  host: process.env.DB_HOST,
  // replication: {
  //   master: {
  //     database: process.env.DB_NAME,
  //     username: process.env.DB_USER,
  //     password: process.env.DB_PASS + '',
  //     port: +process.env.DB_PORT || 5432,
  //     host: process.env.DB_HOST,
  //   },
  //   slaves: [
  //     {
  //       database: process.env.DB_NAME,
  //       username: process.env.DB_USER,
  //       password: process.env.DB_PASS + '',
  //       port: +process.env.DB_PORT || 5432,
  //       host: process.env.DB_HOST,
  //     },
  //   ],
  // },
  entities: [__dirname + '/../../app/entities/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
})
