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
              template: `Ignore all previous instructions. You're a highly skilled email expert, adept at composing all types of emails in an appropriate manner. Your task is to write a new email.

Make the email clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your email content.

Choose simple words and phrases. Avoid ones that are too hard or confusing. Write the email like a real person would. 

Now, write a new email, mentioning these points:
{{KEY_POINTS}}`,
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
              template: `Ignore all previous instructions. You're a highly skilled social media expert, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a new post on {{CURRENT_WEBSITE_DOMAIN}}.

Ensure that the post is in line with the widely observed length, style, inclusion or omission of emojis and hashtags, and format of the highest performing post on {{CURRENT_WEBSITE_DOMAIN}}.

Write the post like a real person would. 

Now, write a {{CURRENT_WEBSITE_DOMAIN}} post, mentioning these points:
{{KEY_POINTS}}`,
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
