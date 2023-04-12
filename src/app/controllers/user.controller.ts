import { Role } from '@entities/role.entity'
import { User } from '@entities/user.entity'
import { Request, Response } from 'express'

export class UsersController {
  async login(req: Request, res: Response) {
    const staff = await Role.findOne({
      where: {
        id: 1,
      },
    })

    const data = await User.create({
      email: 'kent@gmail.com',
      username: 'thanh1',
      password: '123123',
      role: staff,
    }).save()

    return res.status(200).json(data)
  }

  async getUsers(req: Request, res: Response) {
    const data = await User.find({})
    console.log(data)

    return res.status(200).json(data)
  }
}
