export const slackNoti = (requestUserId: number) => {
  const data = {
    channel: 'U052KMP5UCF',
    text: '<!channel>',
    attachments: [
      {
        text: 'Hello, Do you want approve this message?',
        callback_id: requestUserId,
        color: '#3AA3E3',
        attachment_type: 'default',
        actions: [
          {
            name: 'outcomingID',
            text: 'Approve',
            type: 'button',
            style: 'primary',
            value: 'approve',
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
