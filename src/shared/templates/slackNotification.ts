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
  title: string,
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
              text: title,
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

export const slackNotiRejectToStaff = (
  staffSlackId: string,
  staffName: string,
  masterName: string,
) => {
  const data = {
    channel: staffSlackId,
    text: '<!channel>',
    attachments: [
      {
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `Hi *${staffName}* :wave:`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `We're sorry that your request was declined by ${masterName} \n Your request may be denied for the following reasons:`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '• Important meeting \n • The reason is not clear \n • You have taken too much time off compared to the regulations',
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: 'Please check your personal schedule or contact your master',
            },
          },
        ],
      },
    ],
  }
  return JSON.stringify(data)
}
