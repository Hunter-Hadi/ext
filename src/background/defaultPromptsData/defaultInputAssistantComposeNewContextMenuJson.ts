import {
  OUTPUT_CHAT_COMPLETE,
  VARIABLE_AI_RESPONSE_LANGUAGE,
  VARIABLE_AI_RESPONSE_TONE,
  VARIABLE_AI_RESPONSE_WRITING_STYLE,
  VARIABLE_CURRENT_WEBSITE_DOMAIN,
} from '@/background/defaultPromptsData/systemVariables'
import { IContextMenuItem } from '@/features/contextMenu/types'

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
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'd833ef67-36fb-4228-8e04-4b6d7583a341',
              promptName: 'Compose with key points',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'Key points',
                  VariableName: 'KEY_POINTS',
                  valueType: 'Text',
                  placeholder: 'Enter key points',
                },
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
            SetVariablesModalConfig: {
              contextMenuId: 'd833ef67-36fb-4228-8e04-4b6d7583a341',
              title: 'Compose with key points',
              variables: [],
              systemVariables: [],
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
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '1cc8f601-27ac-474f-a70c-20ed1177711a',
              promptName: 'Compose with key points',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                {
                  label: 'Key points',
                  VariableName: 'KEY_POINTS',
                  valueType: 'Text',
                  placeholder: 'Enter key points',
                },
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
            SetVariablesModalConfig: {
              contextMenuId: '1cc8f601-27ac-474f-a70c-20ed1177711a',
              title: 'Compose with key points',
              variables: [],
              systemVariables: [],
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
        whitelist: [
          'twitter.com',
          'linkedin.com',
          'facebook.com',
          'youtube.com',
          'studio.youtube.com',
          'instagram.com',
          'reddit.com',
        ],
        blacklist: [],
        isWhitelistMode: true,
      },
      type: 'group',
      actions: [],
      searchText: 'quick compose',
    },
  },
] as IContextMenuItem[]
