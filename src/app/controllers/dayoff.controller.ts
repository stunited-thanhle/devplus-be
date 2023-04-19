import { Request as RequestEntity } from '@entities/request.entity'

import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import { google } from 'googleapis'
import { User } from '@entities/user.entity'
import { DayOff } from '@entities/dayoff.entity'
import { createConnection } from 'typeorm'
import dataSourceConfig from '@shared/config/data-source.config'

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

  async exportDataDayOffs(req: Request, res: Response) {
    const auth = new google.auth.GoogleAuth({
      keyFile: 'credentials.json',
      scopes: 'https://www.googleapis.com/auth/spreadsheets',
    })

    const dayoffs = await dataSourceConfig
      .getRepository(DayOff)
      .createQueryBuilder('dayoff')
      .where('dayoff.action = :action', { action: 'Day off' })
      .select(['dayoff.id', 'dayoff.requestId', 'dayoff.action'])
      .distinctOn(['dayoff.requestId'])
      .innerJoinAndSelect(
        'dayoff.request',
        'request',
        'request.id = dayoff.requestId',
      )
      .innerJoinAndSelect('request.user', 'user', 'user.id = request.userId')
      .getRawMany()

    console.log(dayoffs)

    // Instance of Google Sheets API
    const sheets = google.sheets({ version: 'v4', auth })

    const spreadsheetId = '1QsC_bAqZziXV7WY9KKEtc90rXOHFp6HXDO7-IkQcYAw'

    // write the user data to the spreadsheet
    // const sheetData = [
    //   ['ID', 'Name', 'Email'],
    //   ...users.map((user) => [user.id, user.username, user.email]),
    // ]

    const sheetData = [
      ['Id', 'User Name', 'Reason', 'From', 'To', 'Quantity'],
      ...dayoffs.map((dayoff) => [
        dayoff.dayoff_id,
        dayoff.user_username,
        dayoff.request_reason,
        dayoff.request_from,
        dayoff.request_to,
        dayoff.request_quantity,
      ]),
    ]

    // user range tu a1 den c + user leng +1
    const range = 'Sheet1!A1:F' + (dayoffs.length + 1)

    const updateOptions = {
      spreadsheetId: spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: sheetData,
      },
    }

    const result = await sheets.spreadsheets.values.update(updateOptions)
    console.log(result)
    console.log('User data has been exported to the Google Sheet.')

    if (result.status !== StatusCodes.OK) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      })
    }

    return res.status(StatusCodes.OK).json({
      message: 'Successfully',
      statusCode: StatusCodes.OK,
      url: 'https://shorturl.at/kmnvF',
    })
  }
}
