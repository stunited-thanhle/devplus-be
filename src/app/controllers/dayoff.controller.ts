import { Request, Response } from 'express'
// import { OAuth2Client } from 'google-auth-library'
// import { GoogleApis } from 'googleapis'
import { Request as RequestEntity } from '@entities/request.entity'
import { StatusCodes } from 'http-status-codes'

export class DayOffController {
  async getDayoffDetail(req: Request, res: Response) {
    const requestId = parseInt(req.params.requestId)

    const request = await RequestEntity.findOne({
      where: {
        id: requestId,
      },
      relations: ['dayoffs'],
    })

    if (request === null) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Not found', statusCode: StatusCodes.NOT_FOUND })
    }

    return res.status(StatusCodes.OK).json(request.dayoffs)
  }

  // async exportData(req: Request, res: Response) {
  //   const oauth2Client = new OAuth2Client({
  //     clientId:
  //       '234151278955-m52u0i3tk407i2c4uqpvocu7hbe3s84a.apps.googleusercontent.com',
  //     clientSecret: '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',
  //     redirectUri: 'YOUR_REDIRECT_URL',
  //   })
  // }
}
