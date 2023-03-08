import { IContextMenuItem } from '@/features/contextMenu'

export default [
  {
    id: 'a517dfdc-2794-4d58-b55e-c440687b00de',
    parent: 'root',
    droppable: true,
    text: 'Write a email to reply',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template: 'Write a email to reply:\n{{GMAIL_MESSAGE_CONTEXT}}',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
] as IContextMenuItem[]
