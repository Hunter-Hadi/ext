import { IContextMenuItem } from '@/features/contextMenu'
import {
  EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  EZMAIL_REPLY_CTA_BUTTON_ID,
  EZMAIL_REPLY_GROUP_ID,
  EZMAIL_NEW_MAIL_GROUP_ID,
} from '@/types'

export default [
  {
    id: '4e54395c-5e8b-4bbd-a309-b6057a4737d3',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Improve writing',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: 'Improve writing',
          },
        },
      ],
      icon: 'AutoFix',
    },
  },
  {
    id: '496d1369-941d-49a5-a9ce-68eadd7601de',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Fix spelling & grammar',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: 'Fix spelling & grammar',
          },
        },
      ],
      icon: 'Done',
    },
  },
  {
    id: '84060107-e962-412b-afa2-f8134e593320',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Paraphrase',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: 'Paraphrase',
          },
        },
      ],
      icon: 'Autorenew',
    },
  },
  {
    id: '6de2edc2-019f-4a6c-9051-a15aa11338a0',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Hello word',
    data: {
      droppable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: 'Say hello word',
          },
        },
      ],
      icon: 'Autorenew',
    },
  },
  {
    id: EZMAIL_REPLY_GROUP_ID,
    parent: 'root',
    droppable: true,
    text: 'Adjust draft',
    data: {
      editable: true,
      type: 'group',
      actions: [],
    },
  },
  {
    id: EZMAIL_NEW_MAIL_GROUP_ID,
    parent: 'root',
    droppable: false,
    text: 'Adjust new email',
    data: {
      editable: true,
      type: 'group',
      actions: [],
    },
  },
  {
    id: EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
    parent: 'root',
    droppable: false,
    text: 'EzMail',
    data: {
      editable: true,
      type: 'shortcuts',
      icon: 'EzMail',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              '"""\n{{GMAIL_MESSAGE_CONTEXT}}\n"""\nWrite a reply to the email above: EZMAIL_NEW_EMAIL_CTA_BUTTON_ID',
          },
        },
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
          },
        },
      ],
    },
  },
  {
    id: EZMAIL_REPLY_CTA_BUTTON_ID,
    parent: 'root',
    droppable: false,
    text: 'EzMail',
    data: {
      editable: true,
      type: 'shortcuts',
      icon: 'EzMail',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              '"""\n{{GMAIL_MESSAGE_CONTEXT}}\n"""\nWrite a reply to the email above: EZMAIL_REPLY_CTA_BUTTON_ID',
          },
        },
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
          },
        },
      ],
    },
  },
] as IContextMenuItem[]
