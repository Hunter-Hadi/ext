import { IContextMenuItem } from '@/features/contextMenu/types'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'

export default [
  {
    id: 'd833ef67-36fb-4228-8e04-4b6d7583a341',
    parent: 'root',
    droppable: true,
    text: 'Enter key points',
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
            template: `Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write an email reply to the following text delimited by triple backticks, which is the last email you received from the recipient earlier on {{CURRENT_WEBSITE_DOMAIN}}.

Text:
\`\`\`
{{EMAIL_DRAFT}}
\`\`\`

Your task requires you to write a concise email reply in a polite, friendly, professional, and proper way.

Make the email reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your email reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing. Write the email reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the email reply is meant to do.

Do not include email subject, just output the email reply message.

Output the email reply without additional context, explanation, or extra wording, just the email reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write the email reply, mentioning these points:`,
            SetVariablesModalConfig: {
              title: 'Enter key points',
              modelKey: 'Sidebar',

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
      searchText: 'quick reply enter key points',
    },
  },
] as IContextMenuItem[]
