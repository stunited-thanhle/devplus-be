import { User } from '@entities/user.entity'
import { ErrorBody } from '@shared/interface/errorInterface'
import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

export class AuthController {
  async login(req: Request, res: Response) {
    const { email, password } = req.body

    const user = await User.findOne({
      where: {
        email,
      },
    })

    if (!user || !(await user.comparePassword(password))) {
      const responseData: ErrorBody = {
        message: 'Invalid email or password',
        statusCode: StatusCodes.UNAUTHORIZED,
      }
      return res.status(StatusCodes.UNAUTHORIZED).json(responseData)
    }

    const token = user.token

    delete user.password

    return res.status(200).json({ user, token })
  }

  async getUsers(req: Request, res: Response) {
    const data = await User.find({})
    return res.status(200).json(data)
  }
}
