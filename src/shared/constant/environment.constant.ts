export const environment = {
  env: process.env.NODE_ENV,
  port: +(process.env.APP_PORT ?? 0),
  database: {
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT,
    host: process.env.DB_HOST,
  },
}
