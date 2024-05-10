import {
  IContextMenuItem,
  IContextMenuItemWithChildren,
} from '@/features/contextMenu/types'
/**
 * 基于Draft操作的上下文菜单ID集合
 */
export const CONTEXT_MENU_DRAFT_TYPES = {
  REPLACE_SELECTION: '397f0c89-596c-4433-be95-02faeccee083',
  INSERT_BELOW: 'd0b0b2a0-0b7e-4b1e-9b0e-5b7b6b2b4b2b',
  INSERT: '5fd6256c-f03c-4520-8df4-64b248247216',
  CONTINUE_WRITING: '207d0f63-7905-479f-9962-1e3ebd0b65ee',
  INSERT_ABOVE: '1f755cfe-cc56-4a73-9cc4-d2baf2c39624',
  TRY_AGAIN: '6b9f9cb4-b1b1-4897-9156-903dbc52b2a1',
  DISCARD: '82dc6fe3-da3d-437c-aa0e-268e4f602787',
  MAKE_LONGER: '2bd23d4b-6f6b-491c-a42f-f6c24a3b075d',
  MAKE_SHORTER: '44ea14bf-e81d-4e24-9627-b2ce9b1546dd',
  CONTINUE_IN_CHAT: '9642aa63-4c26-4b5a-8109-e51c4a92df0b',
  COPY: '8fcccd1e-eb6e-419e-8c79-d8bc7c10e72c',
  ACCEPT_AND_COPY: '5aafdf09-36e4-46a0-be37-5eba07364f33',
}
/**
 * 特殊需求的分隔符的contextMenu ID集合
 * [ContextMenu] Replace selection
 * [ContextMenu] Insert below
 * [ContextMenu] Copy
 * [ContextMenu] Continue writing
 * [Divider] --
 * [ContextMenu] Continue in Chat
 * [Divider] --
 * [ContextMenu] Try again
 * [ContextMenu] Discard
 */
export const SPECIAL_NEED_DIVIDER_KEYS = [
  CONTEXT_MENU_DRAFT_TYPES.CONTINUE_IN_CHAT,
  CONTEXT_MENU_DRAFT_TYPES.TRY_AGAIN,
]

export const CONTEXT_MENU_DRAFT_LIST: IContextMenuItemWithChildren[] = [
  {
    id: CONTEXT_MENU_DRAFT_TYPES.REPLACE_SELECTION,
    text: 'Replace selection',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'Done',
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.INSERT,
    text: 'Insert',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'NoteRight',
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
      icon: 'NoteDown',
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.ACCEPT_AND_COPY,
    text: 'Accept and copy',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.COPY,
    text: 'Copy',
    parent: 'root',
    droppable: false,
    data: {
      type: 'shortcuts',
      editable: false,
      icon: 'Copy',
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
      icon: 'DefaultIcon',
      actions: [
        // 这里获取传进来的Active message id
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'ACTIVE_MESSAGE_ID',
          },
        },
        {
          type: 'SCRIPTS_CONDITIONAL',
          parameters: {
            WFCondition: 'Equals',
            WFFormValues: {
              Value: '',
              WFSerializationType: 'WFDictionaryFieldValue',
            },
            // 如果Active message id为空，获取最后一条AI消息
            WFConditionalIfTrueActions: [
              {
                type: 'MAXAI_GET_CHAT_MESSAGES',
                parameters: {
                  ActionChatMessageType: 'ai',
                },
              },
              {
                type: 'SCRIPTS_GET_ITEM_FROM_LIST',
                parameters: {
                  ActionGetItemFromListType: 'last',
                },
              },
            ],
            // 如果Active message id不为空，获取Active message id对应的消息
            WFConditionalIfFalseActions: [
              {
                type: 'MAXAI_GET_CHAT_MESSAGES',
                parameters: {
                  ActionChatMessageType: 'ai',
                },
              },
              {
                type: 'SCRIPTS_GET_ITEM_FROM_LIST',
                parameters: {
                  ActionGetItemFromListType: 'matchEqual',
                  ActionGetItemFromMatchKey: 'messageId',
                  ActionGetItemFromMatchValue: '{{ACTIVE_MESSAGE_ID}}',
                },
              },
            ],
          },
        },
        {
          type: 'SCRIPTS_DICTIONARY',
          parameters: {},
        },
        {
          type: 'SCRIPTS_GET_DICTIONARY_VALUE',
          parameters: {
            ActionGetDictionaryKey: 'value',
            ActionGetDictionaryValue: 'text',
          },
        },
        {
          type: 'SLICE_OF_TEXT',
          parameters: {
            SliceTextActionType: 'TOKENS',
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'LAST_AI_MESSAGE_OUTPUT',
          },
        },
        {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'add',
            ActionChatMessageConfig: {
              messageId: '',
              parentMessageId: undefined,
              text: ``,
              type: 'user',
              meta: {
                contexts: [
                  {
                    type: 'text',
                    value: '{{LAST_AI_MESSAGE_OUTPUT}}',
                    key: 'Draft',
                  },
                ],
                contextMenu: {
                  id: CONTEXT_MENU_DRAFT_TYPES.CONTINUE_WRITING,
                  droppable: false,
                  parent: '',
                  text: 'Continue writing',
                  data: {
                    editable: false,
                    type: 'shortcuts',
                    actions: [],
                  },
                } as IContextMenuItem,
                includeHistory: false,
              },
            },
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'USER_MESSAGE_ID',
          },
        },
        {
          type: 'CHAT_MESSAGE',
          parameters: {
            ActionChatMessageOperationType: 'add',
            ActionChatMessageConfig: {
              messageId: '',
              parentMessageId: '{{USER_MESSAGE_ID}}',
              text: `{{LAST_AI_MESSAGE_OUTPUT}}`,
              type: 'ai',
            },
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'OUTPUT_MESSAGE_ID',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            AskChatGPTActionQuestion: {
              text: "Ignore all previous instructions. You are the original author of the unfinished text delimited by triple backticks. Your task is to continue writing the following unfinished text delimited by triple backticks.\n\nYour task requires you to pick up where the text is left off, making sure to maintain the same tone, writing style, structure, intended audience, and direction of the unfinished text. Continue the writing in a manner consistent with how the original author would have written.\n\nOnly write no more than 100 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the continued text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{LAST_AI_MESSAGE_OUTPUT}}\n```",
              meta: {
                outputMessageId: `{{OUTPUT_MESSAGE_ID}}`,
                contextMenu: {
                  id: CONTEXT_MENU_DRAFT_TYPES.CONTINUE_WRITING,
                  droppable: false,
                  parent: '',
                  text: 'Continue writing',
                  data: {
                    editable: false,
                    type: 'shortcuts',
                    actions: [],
                  },
                } as IContextMenuItem,
              },
            },
            AskChatGPTActionType: 'ASK_CHAT_GPT_HIDDEN_QUESTION',
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
      icon: 'Replay',
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
  {
    id: CONTEXT_MENU_DRAFT_TYPES.CONTINUE_IN_CHAT,
    text: 'Continue in chat',
    parent: 'root',
    droppable: false,
    data: {
      icon: 'SidebarPanel',
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
      icon: 'Delete',
      type: 'shortcuts',
      editable: false,
    },
    children: [],
  },
]
