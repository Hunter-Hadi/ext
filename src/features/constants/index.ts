import { IContextMenuItemWithChildren } from '@/features/contextMenu/types'

/**
 * 基于Draft操作的上下文菜单ID集合
 */
export const CONTEXT_MENU_DRAFT_TYPES = {
  REPLACE_SELECTION: '397f0c89-596c-4433-be95-02faeccee083',
  INSERT_BELOW: 'd0b0b2a0-0b7e-4b1e-9b0e-5b7b6b2b4b2b',
  CONTINUE_WRITING: '207d0f63-7905-479f-9962-1e3ebd0b65ee',
  INSERT_ABOVE: '1f755cfe-cc56-4a73-9cc4-d2baf2c39624',
  TRY_AGAIN: '6b9f9cb4-b1b1-4897-9156-903dbc52b2a1',
  DISCARD: '82dc6fe3-da3d-437c-aa0e-268e4f602787',
  MAKE_LONGER: '2bd23d4b-6f6b-491c-a42f-f6c24a3b075d',
  MAKE_SHORTER: '44ea14bf-e81d-4e24-9627-b2ce9b1546dd',
}

export const CONTEXT_MENU_DRAFT_LIST: IContextMenuItemWithChildren[] = [
  {
    id: CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
    text: 'Replace selection',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.INSERT_BELOW,
    text: 'Insert below',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.CONTINUE_WRITING,
    text: 'Continue writing',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'I have an unfinished text and I hope you can help me continue with the next paragraph. You don\'t need to complete all the content. Please continue the text from the following points that match the tone, writing style, structure, target audience, and direction that my text should take.\nWrite in {{AI_OUTPUT_LANGUAGE}}.\nHere is the text:\n"""\n{{LAST_AI_OUTPUT}}\n"""',
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
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.TRY_AGAIN,
    text: 'Try again',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.DISCARD,
    text: 'Discard',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
]
