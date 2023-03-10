import { IContextMenuItem } from '@/features/contextMenu'

export default [
  {
    id: 'f6040e1a-9c85-48c5-bff5-c09d4eafb37f',
    parent: '89fcbb28-cf6f-4629-be3b-a8a5b14e6efe',
    droppable: true,
    text: 'EzMail Button Action',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template: 'Write an email to reply:\n {{GMAIL_MESSAGE_CONTEXT}}',
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
    id: '4345a68e-a3c1-4173-ac70-2ab917c82739',
    parent: '89fcbb28-cf6f-4629-be3b-a8a5b14e6efe',
    droppable: true,
    text: 'Ezmail Button Action2',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Write an email to reply:\n"""\n {{GMAIL_MESSAGE_CONTEXT}}\n"""',
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
    id: 'c837d69f-2dd8-4766-87d3-b0ded16ae4f3',
    parent: '89fcbb28-cf6f-4629-be3b-a8a5b14e6efe',
    droppable: true,
    text: 'Improve writing draft',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Improve the writing in the following text, do not write explanations:\n{{GMAIL_DRAFT_CONTEXT}}',
          },
        },
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
          },
        },
      ],
    },
  },
  {
    id: '89fcbb28-cf6f-4629-be3b-a8a5b14e6efe',
    parent: 'root',
    droppable: true,
    text: 'Dropdown list',
    data: {
      editable: false,
      type: 'group',
      actions: [],
    },
  },
] as IContextMenuItem[]
