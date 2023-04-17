import { Request } from '@entities/request.entity'

export const slackNoti = (item: any, request: Request) => {
  const data = {
    channel: item.slackId,
    text: '<!channel>',
    attachments: [
      {
        text: 'Hello, Do you want approve this message?',
        callback_id: request.id,
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'outcomingID',
            text: 'Accept',
            type: 'button',
            style: 'primary',
            value: 'accept',
          },
          {
            name: 'outcoming1ID',
            text: 'Reject',
            type: 'button',
            style: 'danger',
            value: 'reject',
          },
        ],
      },
    ],
  }

  return JSON.stringify(data)
}

export const slackNotiDayoff = (
  name: string,
  type: string,
  from: Date,
  to: Date,
  quantity: number,
  reason: string,
) => {
  const data = {
    channel: 'C05308YPC02',
    text: '<!channel>',
    attachments: [
      {
        color: '#f2c744',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: 'New request',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Type:*\n ${type}`,
              },
              {
                type: 'mrkdwn',
                text: `*Created by:*\n ${name}`,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*From:*\n ${from}`,
              },
              {
                type: 'mrkdwn',
                text: `*To:*\n ${to}`,
              },
            ],
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Quantity:*\n ${quantity} (days)`,
              },
              {
                type: 'mrkdwn',
                text: `*Reason:*\n ${reason}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '<http://localhost:5173|View request>',
            },
          },
        ],
      },
    ],
  }

  return JSON.stringify(data)
}
