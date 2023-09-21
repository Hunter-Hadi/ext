import { IContextMenuItem } from '@/features/contextMenu/types'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'

export default [
  {
    id: 'd833ef67-36fb-4228-8e04-4b6d7583a341',
    parent: 'c73787fb-e2fd-41f2-8ad0-854b2a624022',
    droppable: true,
    text: 'Compose with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SLICE_OF_TEXT',
          parameters: {
            SliceTextActionTokens: PAGE_SUMMARY_MAX_TOKENS,
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'EMAIL_DRAFT',
          },
        },
        {
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            SetVariablesModalConfig: {
              contextMenuId: 'd833ef67-36fb-4228-8e04-4b6d7583a341',
              title: 'Compose with key points',
              modelKey: 'Sidebar',
              template: `Write an email:\n{{KEY_POINTS}}`,
              variables: [
                {
                  label: 'Key points',
                  VariableName: 'KEY_POINTS',
                  valueType: 'Text',
                  placeholder: 'Enter key points',
                },
              ],
              systemVariables: [
                {
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  defaultValue: 'English',
                },
                {
                  VariableName: 'AI_RESPONSE_TONE',
                  defaultValue: 'Default',
                },
                {
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  defaultValue: 'Default',
                },
              ],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick compose compose with key points',
    },
  },
  {
    id: 'c73787fb-e2fd-41f2-8ad0-854b2a624022',
    parent: 'root',
    droppable: true,
    text: 'Quick compose',
    data: {
      editable: false,
      visibility: {
        whitelist: [
          'outlook.live.com',
          'outlook.office365.com',
          'mail.google.com',
          'outlook.office.com',
        ],
        blacklist: [],
        isWhitelistMode: true,
      },
      type: 'group',
      actions: [],
      searchText: 'quick compose',
    },
  },
  {
    id: '1cc8f601-27ac-474f-a70c-20ed1177711a',
    parent: 'fef7401d-ecd3-4bae-94b1-8307cf85fa2f',
    droppable: true,
    text: 'Compose with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SLICE_OF_TEXT',
          parameters: {
            SliceTextActionTokens: PAGE_SUMMARY_MAX_TOKENS,
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'EMAIL_DRAFT',
          },
        },
        {
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            SetVariablesModalConfig: {
              contextMenuId: 'd833ef67-36fb-4228-8e04-4b6d7583a341',
              title: 'Compose with key points',
              modelKey: 'Sidebar',
              template: `Write an post in {{CURRENT_WEBSITE_DOMAIN}}:\n{{KEY_POINTS}}`,
              variables: [
                {
                  label: 'Key points',
                  VariableName: 'KEY_POINTS',
                  valueType: 'Text',
                  placeholder: 'Enter key points',
                },
              ],
              systemVariables: [
                {
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  defaultValue: 'English',
                },
                {
                  VariableName: 'AI_RESPONSE_TONE',
                  defaultValue: 'Default',
                },
                {
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  defaultValue: 'Default',
                },
              ],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick compose compose with key points',
    },
  },
  {
    id: 'fef7401d-ecd3-4bae-94b1-8307cf85fa2f',
    parent: 'root',
    droppable: true,
    text: 'Quick compose',
    data: {
      editable: false,
      visibility: {
        whitelist: ['twitter.com'],
        blacklist: [],
        isWhitelistMode: true,
      },
      type: 'group',
      actions: [],
      searchText: 'quick compose',
    },
  },
] as IContextMenuItem[]
