import { IContextMenuItem } from '@/features/contextMenu/types'
import { PAGE_SUMMARY_MAX_TOKENS } from '@/features/shortcuts/constants'

const socialMediaPrompts = [
  // 社交媒体
  {
    id: '26f44f32-cbe8-4832-9049-7b64aa2198fb',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Like',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an agreeable, approving, affirming, positive, supportive, confirming, endorsing, acknowledging, understanding, simple recognition, and liking reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply like',
    },
  },
  {
    id: '31d488a9-0d16-48ce-b865-6c7667ebf573',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Love',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an affectionate, passionate, warm, fond, admiring, adoring, caring, supportive, joyful, grateful, delighted, enamored, and loving reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply love',
    },
  },
  {
    id: '1d93656a-fbf0-4650-b3b9-e735b36caca3',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Thanks',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an affectionate, grateful, and delighted reply to the message/post that responds 'thank you' for whatever the message/post is about. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply thanks',
    },
  },
  {
    id: 'bda41b5f-2985-4dd2-8b09-3bb958ab24d9',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Care',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a compassionate, empathetic, sympathetic, considerate, supportive, understanding, comforting, consoling, reassuring, concerned, nurturing, and caring reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply care',
    },
  },
  {
    id: '115cbff4-aeb5-49f5-884c-09971d39314e',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Joke',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a humorous, entertaining, playful, and funny reply to the message/post joking about it. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply joke',
    },
  },
  {
    id: 'bdbd5e9e-355b-4563-bd8d-74e7586fdbdd',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Wow',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an astonished, amazed, awestruck, shocked, startled, impressed, intrigued, dumbfounded, bewildered, flabbergasted, taken-aback, and surprised reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply wow',
    },
  },
  {
    id: '0f6ba970-ed50-4d03-8582-29d4561ea2b6',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Sad',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an unhappy, sorrowful, mournful, grieving, despondent, melancholic, lamenting, hurt, pained, empathetic, downcast, disappointed, depressed, and sad reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply sad',
    },
  },
  {
    id: '730b1b2d-809b-428b-9967-9c3b53154bbf',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Dislike',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a disagreeing, disapproving, rejecting, negative, critical, dissenting, disappointing, unsupportive, refusing, disfavoring, opposing, negating, and disliking reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{POST_CONTENT}}\n```",
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
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply dislike',
    },
  },
  {
    id: '9a65c4c0-c2b8-4fe1-a85e-0e2d84682eb1',
    parent: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    droppable: true,
    text: 'Reply with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
          parameters: {},
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'POST_CONTENT',
          },
        },
        {
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            SetVariablesModalConfig: {
              contextMenuId: '6e14fd11-a06e-40b3-97d5-3fc0515288b0',
              title: 'Reply with key points',
              modelKey: 'Sidebar',
              template: `Ignore all previous instructions. You're a highly skilled social media expert, specialized in {{CURRENT_WEBSITE_DOMAIN}}, adept at responding to all types of {{CURRENT_WEBSITE_DOMAIN}} posts and messages in an appropriate manner. 

Your task is to write a reply to the following post/message on {{CURRENT_WEBSITE_DOMAIN}}, delimited by triple backticks.

Post/message:
\`\`\` 
{{POST_CONTENT}}
\`\`\` 

Make the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the post/message and the purpose of your reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing.

Do not use hashtags. Write the reply like a real person would. 

Output the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write a concise reply to the post/message above by properly expanding the following points:
{{KEY_POINTS}}`,
              variables: [
                {
                  label: 'Context',
                  VariableName: 'POST_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue: '{{POST_CONTENT}}',
                },
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
      searchText: 'quick reply reply with key points',
    },
  },
  {
    id: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    parent: 'root',
    droppable: true,
    text: 'Quick reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: ['twitter.com'],
        blacklist: [],
        isWhitelistMode: true,
      },
      searchText: 'social media quick reply',
      icon: 'Reply',
    },
  },
] as IContextMenuItem[]

const emailPrompts = [
  // 邮件
  {
    id: '55a875ba-c2a7-449a-8af8-36c361e8def0',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'Yes',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'yes' to whatever the recipient is asking for in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
            AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply yes',
    },
  },
  {
    id: 'ac69b62c-b8f7-4052-ad4d-4923325a1ba4',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'No',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'no' to whatever the recipient is asking for in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
            AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply no',
    },
  },
  {
    id: 'ab57ed6e-3363-4f71-85ef-be17fdf086e3',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'Thanks',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'thank you', without confirming or denying whatever the recipient is asking for, in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
            AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply thanks',
    },
  },
  {
    id: 'c7171cca-7db0-46bb-8357-036068ec50db',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'Sorry',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'sorry', without confirming or denying whatever the recipient is asking for, in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
            AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply sorry',
    },
  },
  {
    id: 'ec19a0f6-346b-4d8f-bfab-8a88aa3760f2',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'More info',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'provide more information and details', without confirming or denying whatever the recipient is asking for, in a polite, friendly, professional, and proper way. \n\nSpecify the additional information you ask for, presenting it in a clear format.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
            AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply more info',
    },
  },
  {
    id: 'b1cd46eb-ca76-437e-841e-f7714aaea215',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'Joke',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a humorous, entertaining, playful, and funny email reply joking about the email message, without confirming or denying whatever the recipient is asking for.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 50 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
            AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply joke',
    },
  },
  {
    id: 'eeb8c14c-b058-42ac-a7dd-6e78d74264a2',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'Follow-up',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a follow-up email message to the following text delimited by triple backticks, which is the last email I sent to the recipient earlier on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a concise follow-up email message to ask for a response in a polite, friendly, professional, and proper way. Make the content sincere, persuasive, and appealing. Also, mention any important numbers and details, if any, from previous emails that are helpful for clarification and making the follow-up compelling.\n\nMake the follow-up clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your follow-up.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the follow-up like a real person would. Keep your tone balanced, not too casual or too formal, to match what the follow-up is meant to do.\n\nDo not include email subject, just output the follow-up message. Ensure the follow-up's word count is no more than 100 words.\n\nOutput the follow-up without additional context, explanation, or extra wording, just the follow-up itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
            AskChatGPTActionType: 'ASK_CHAT_GPT_WITH_PREFIX',
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'quick reply follow-up',
    },
  },
  {
    id: '47070ec6-8700-43fd-a519-20fe3841df38',
    parent: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    droppable: true,
    text: 'Reply with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
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
            VariableName: 'EMAIL_CONTEXT',
          },
        },
        {
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            SetVariablesModalConfig: {
              contextMenuId: '47070ec6-8700-43fd-a519-20fe3841df38',
              template: `Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write an email reply to the following text delimited by triple backticks, which is the last email you received from the recipient earlier on {{CURRENT_WEBSITE_DOMAIN}}.

Text:
\`\`\`
{{EMAIL_CONTEXT}}
\`\`\`

Your task requires you to write a concise email reply in a polite, friendly, professional, and proper way.

Make the email reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your email reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing. Write the email reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the email reply is meant to do.

Do not include email subject, just output the email reply message.

Output the email reply without additional context, explanation, or extra wording, just the email reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write the email reply, mentioning these points:\n{{KEY_POINTS}}`,
              title: 'Reply with key points',
              modelKey: 'Sidebar',
              variables: [
                {
                  label: 'Email context',
                  VariableName: 'EMAIL_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter email context',
                  defaultValue: '{{EMAIL_CONTEXT}}',
                },
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
      searchText: 'quick reply reply with key points',
    },
  },
  {
    id: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    parent: 'root',
    droppable: true,
    text: 'Quick reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [
          'outlook.live.com',
          'outlook.office365.com',
          'outlook.office.com',
          'mail.google.com',
        ],
        blacklist: [],
        isWhitelistMode: true,
      },
      searchText: 'email quick reply',
      icon: 'Reply',
    },
  },
] as IContextMenuItem[]
export default [...emailPrompts, ...socialMediaPrompts] as IContextMenuItem[]
