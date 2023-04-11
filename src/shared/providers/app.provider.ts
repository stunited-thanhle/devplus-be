import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import hpp from 'hpp'
import * as routers from '@routers'
import * as dotenv from 'dotenv'

dotenv.config()

class AppProvider {
  public app: express.Application

  constructor() {
    this.app = express()

    this.initializeMiddlewares()
    this.initializeRoutes()
  }

  public listen() {
    this.app.listen(process.env.APP_PORT, () => {
      console.log(process.env.APP_PORT)
      console.log('adad')
    })
  }

  private initializeMiddlewares() {
    this.app.use(cors())
    this.app.use(hpp())
    this.app.use(helmet())
    this.app.use(compression())
    this.app.use(express.json())
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(cookieParser())
  }

  private initializeRoutes() {
    const routeList = Object.values(routers)

    routeList.forEach((route) => {
      this.app.use(route.path, route.router)
    })

    this.app.get('/abc', (req, res) => {
      res.send('hello word')
    })
  }
}

export const appProvider = new AppProvider()
