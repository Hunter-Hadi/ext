import { IContextMenuItem } from '@/features/contextMenu/types'

export default [
  {
    id: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    parent: 'b83cb482-710d-4e48-9b22-43b8e8ea3a02',
    droppable: true,
    text: 'Quick reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      icon: 'Reply',
      searchText: 'messaging quick reply',
    },
  },
  {
    id: '0607ffb9-e0fb-41b5-9e02-afabff22acb6',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Like',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an agreeable, approving, affirming, positive, supportive, confirming, endorsing, acknowledging, understanding, simple recognition, and liking reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '2822ad40-9f2c-4db8-961b-50636218edc7',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Love',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an affectionate, passionate, warm, fond, admiring, adoring, caring, supportive, joyful, grateful, delighted, enamored, and loving reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '4d59573b-7e84-4fb0-8d55-582bd4a5c948',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Thanks',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an affectionate, grateful, and delighted reply to the message/post that responds 'thank you' for whatever the message/post is about. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '6325c4b4-5b4c-457b-849a-eacdcb37edfb',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Care',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a compassionate, empathetic, sympathetic, considerate, supportive, understanding, comforting, consoling, reassuring, concerned, nurturing, and caring reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '32dd4492-4ec4-44a9-ba53-32223bf385fe',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Joke',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a humorous, entertaining, playful, and funny reply to the message/post joking about it. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '5bb90f56-7cae-4662-9d59-dd2c6ff941ec',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Wow',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an astonished, amazed, awestruck, shocked, startled, impressed, intrigued, dumbfounded, bewildered, flabbergasted, taken-aback, and surprised reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: 'c4f861da-75ee-4afb-86a7-de234c0c2309',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Sad',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an unhappy, sorrowful, mournful, grieving, despondent, melancholic, lamenting, hurt, pained, empathetic, downcast, disappointed, depressed, and sad reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '31e2d82e-5176-43a5-af28-33b873f27496',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Dislike',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "\nIgnore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a disagreeing, disapproving, rejecting, negative, critical, dissenting, disappointing, unsupportive, refusing, disfavoring, opposing, negating, and disliking reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '32f31576-0ab8-4fc8-966d-426970abede6',
    parent: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    droppable: true,
    text: 'Reply with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            SetVariablesModalConfig: {
              contextMenuId: '32f31576-0ab8-4fc8-966d-426970abede6',
              title: 'Reply with key points',
              modelKey: 'Sidebar',
              template:
                "Ignore all previous instructions. You're a highly skilled messaging expert, adept at responding to all types of chat messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a chat message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{CONTEXT}}\n``` \n\nInclude the following aspects in the reply:\n{{KEY_POINTS}}",
              variables: [
                {
                  label: 'Context',
                  VariableName: 'CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue: '{{SELECTED_TEXT}}',
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
    id: 'a261c7e0-1a4f-485f-a9e0-9998c45cd08c',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'Yes',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'yes' to whatever the recipient is asking for in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'quick reply yes',
    },
  },
  {
    id: '5b4fb377-411b-497b-89d8-045603632f08',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'No',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'no' to whatever the recipient is asking for in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'quick reply no',
    },
  },
  {
    id: '8a12f88f-9216-4e92-ad41-b4f55c4cfc2b',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'Thanks',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'thank you', without confirming or denying whatever the recipient is asking for, in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: 'f20dcaf5-5133-4046-b129-174f49d0d16c',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'Sorry',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'sorry', without confirming or denying whatever the recipient is asking for, in a polite, friendly, professional, and proper way.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'quick reply sorry',
    },
  },
  {
    id: '016adb2d-794e-41ae-9da7-b80a2fc146ca',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'More info',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an email reply which responds 'provide more information and details', without confirming or denying whatever the recipient is asking for, in a polite, friendly, professional, and proper way. \n\nSpecify the additional information you ask for, presenting it in a clear format.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 100 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'quick reply more info',
    },
  },
  {
    id: '379124bc-8db4-4b62-b453-cd8e8ab3523e',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'Joke',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is an email message on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a humorous, entertaining, playful, and funny email reply joking about the email message, without confirming or denying whatever the recipient is asking for.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nDo not include email subject, just output the reply message. Ensure the reply's word count is no more than 50 words.\n\nOutput the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '370bca5c-6e3e-4daa-96ac-070ffe8af179',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'Follow-up',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write a follow-up email message to the following text delimited by triple backticks, which is the last email I sent to the recipient earlier on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a concise follow-up email message to ask for a response in a polite, friendly, professional, and proper way. Make the content sincere, persuasive, and appealing. Also, mention any important numbers and details, if any, from previous emails that are helpful for clarification and making the follow-up compelling.\n\nMake the follow-up clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your follow-up.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the follow-up like a real person would. Keep your tone balanced, not too casual or too formal, to match what the follow-up is meant to do.\n\nDo not include email subject, just output the follow-up message. Ensure the follow-up's word count is no more than 100 words.\n\nOutput the follow-up without additional context, explanation, or extra wording, just the follow-up itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'quick reply follow-up',
    },
  },
  {
    id: '0815c986-5bd2-49a7-a62f-eeb2c49907da',
    parent: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    droppable: true,
    text: 'Reply with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'SET_VARIABLES_MODAL',
          parameters: {
            SetVariablesModalConfig: {
              contextMenuId: '0815c986-5bd2-49a7-a62f-eeb2c49907da',
              title: 'Reply with key points',
              modelKey: 'Sidebar',
              template: `Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write an email reply to the following text delimited by triple backticks, which is the last email you received from the recipient earlier on {{CURRENT_WEBSITE_DOMAIN}}.

Text:
\`\`\`
{{CONTEXT}}
\`\`\`

Your task requires you to write a concise email reply in a polite, friendly, professional, and proper way.

Make the email reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your email reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing. Write the email reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the email reply is meant to do.

Do not include email subject, just output the email reply message.

Output the email reply without additional context, explanation, or extra wording, just the email reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write the email reply, mentioning these points:\n{{KEY_POINTS}}`,
              variables: [
                {
                  label: 'Email context',
                  VariableName: 'CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter email context',
                  defaultValue: '{{SELECTED_TEXT}}',
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
    id: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    parent: '5faf9b14-f2c3-4d3c-a43b-ab9f6e4747b1',
    droppable: true,
    text: 'Quick reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'email quick reply',
      icon: 'Reply',
    },
  },
  {
    id: '5faf9b14-f2c3-4d3c-a43b-ab9f6e4747b1',
    parent: 'root',
    droppable: true,
    text: 'Email',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [
          'mail.yahoo.com',
          'outlook.live.com',
          'outlook.office365.com',
          'outlook.office.com',
          'mail.google.com',
        ],
        blacklist: [],
        isWhitelistMode: true,
      },
      searchText: 'email',
    },
  },
  {
    id: '4f3d7b3b-62e5-4e88-bd79-01efd7ef0bd0',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Like',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an agreeable, approving, affirming, positive, supportive, confirming, endorsing, acknowledging, understanding, simple recognition, and liking reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '8294f143-2727-4de6-9065-12358f87a7bd',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Love',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an affectionate, passionate, warm, fond, admiring, adoring, caring, supportive, joyful, grateful, delighted, enamored, and loving reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '3e4d313f-8a15-48b2-beb9-1f05f93b4d4f',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Thanks',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an affectionate, grateful, and delighted reply to the message/post that responds 'thank you' for whatever the message/post is about. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '176a963c-849e-4cd7-8bf3-84e4531f0cc0',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Care',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a compassionate, empathetic, sympathetic, considerate, supportive, understanding, comforting, consoling, reassuring, concerned, nurturing, and caring reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '0486d1dc-b6bd-4c9b-a861-660e1f87f621',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Joke',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a humorous, entertaining, playful, and funny reply to the message/post joking about it. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '93c3fd09-315d-447d-bbdf-052a78511f39',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Wow',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an astonished, amazed, awestruck, shocked, startled, impressed, intrigued, dumbfounded, bewildered, flabbergasted, taken-aback, and surprised reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: 'c4ed94fc-d8cc-4633-b563-4a94582ab58c',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Sad',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write an unhappy, sorrowful, mournful, grieving, despondent, melancholic, lamenting, hurt, pained, empathetic, downcast, disappointed, depressed, and sad reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: 'd426af1d-4055-4ada-b359-648b9ada81e7',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Dislike',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You're a highly skilled social media expert, adept at responding to all types of social media messages and posts in an appropriate manner. Your task is to write a reply to the following text delimited by triple backticks, which is a social media message or post on {{CURRENT_WEBSITE_DOMAIN}}.\n\nYour task requires you to write a disagreeing, disapproving, rejecting, negative, critical, dissenting, disappointing, unsupportive, refusing, disfavoring, opposing, negating, and disliking reply to the message/post. Keep the reply as short as possible.\n\nMake the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the message/post and the purpose of your reply.\n\nChoose simple words and phrases. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the reply is meant to do.\n\nEnsure the reply's word count is no more than 50 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
    id: '6e14fd11-a06e-40b3-97d5-3fc0515288b0',
    parent: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    droppable: true,
    text: 'Reply with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
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
{{CONTEXT}}
\`\`\` 

Make the reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the post/message and the purpose of your reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing.

Do not use hashtags. Write the reply like a real person would. 

Output the reply without additional context, explanation, or extra wording, just the reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write a concise reply to the post/message above by writing a better version of the following points:
{{KEY_POINTS}}`,
              variables: [
                {
                  label: 'Context',
                  VariableName: 'CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue: '{{SELECTED_TEXT}}',
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
    id: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    parent: '4d7c6a66-1905-43c1-826b-0b8201461d47',
    droppable: true,
    text: 'Quick reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'social media quick reply',
      icon: 'Reply',
    },
  },
  {
    id: '4d7c6a66-1905-43c1-826b-0b8201461d47',
    parent: 'root',
    droppable: true,
    text: 'Social media',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [
          'tiktok.com',
          'twitch.tv',
          'zhihu.com',
          'zhuanlan.zhihu.com',
          'bilibili.com',
          'quora.com',
          'web.facebook.com',
          'medium.com',
          'studio.youtube.com',
          'reddit.com',
          'fiverr.com',
          'instagram.com',
          'twitter.com',
          'facebook.com',
          'youtube.com',
          'linkedin.com',
        ],
        blacklist: [],
        isWhitelistMode: true,
      },
      searchText: 'social media',
    },
  },
  {
    id: 'c0f7a642-9e34-4b1f-a2ee-1c4c5e93fa23',
    parent: '3cc70e82-29db-45a0-8136-7ba4cf90bf8e',
    droppable: true,
    text: 'Continue writing',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: '{{SELECTED_TEXT}}\n{{POPUP_DRAFT}}',
          },
        },
        {
          type: 'SLICE_OF_TEXT',
          parameters: {
            SliceTextActionTokens: 3000,
          },
        },
        {
          type: 'SET_VARIABLE',
          parameters: {
            VariableName: 'MAXAI_CONTINUE_WRITING_TEXT_DRAFT',
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are the original author of the unfinished text delimited by triple backticks. Your task is to continue writing the following unfinished text delimited by triple backticks.\n\nYour task requires you to pick up where the text is left off, making sure to maintain the same tone, writing style, structure, intended audience, and direction of the unfinished text. Continue the writing in a manner consistent with how the original author would have written.\n\nOnly write no more than 100 words.\n\nOutput the answer without additional context, explanation, or extra wording, just the continued text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{MAXAI_CONTINUE_WRITING_TEXT_DRAFT}}\n```",
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
      icon: 'DefaultIcon',
      searchText: 'write with ai continue writing',
    },
  },
  {
    id: 'b517f321-5533-41e5-8ed0-64eb6aa4b7bd',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'English',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into English.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate english',
    },
  },
  {
    id: 'e5a30298-52e9-431d-89d8-6f5431c236c9',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Chinese (Simplified)',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Chinese (Simplified).\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate chinese (simplified)',
    },
  },
  {
    id: '0cb5746c-b879-4ac4-86fb-49f366c81542',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Chinese (Traditional)',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Chinese (Traditional).\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate chinese (traditional)',
    },
  },
  {
    id: '481f6d4a-9045-4cd0-b5e7-1eec6822bed3',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Portuguese',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Portuguese.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate portuguese',
    },
  },
  {
    id: '1aabb1d3-f1af-4e81-aab9-fe4d16630cc3',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Spanish',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Spanish.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate spanish',
    },
  },
  {
    id: 'ad6cebdb-c5ab-4db5-8776-95d6381b90de',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'French',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into French.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate french',
    },
  },
  {
    id: '6de2edc2-019f-4a6c-9051-a15aa11338a0',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Korean',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Korean.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate korean',
    },
  },
  {
    id: '24766e7e-a419-4992-aaaf-786a37a0e111',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Vietnamese',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Vietnamese.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate vietnamese',
    },
  },
  {
    id: '2a753c24-a5cb-496a-a34b-1037e366e690',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Japanese',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Japanese.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate japanese',
    },
  },
  {
    id: '3aca0447-12a5-4453-b4b2-64e45f16598a',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Russian',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Russian.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate russian',
    },
  },
  {
    id: '8b6f4e3f-7669-44a8-a020-fb88c5c9d592',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'German',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into German.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate german',
    },
  },
  {
    id: 'fee4c3e1-8970-436a-a535-e6085f283973',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Turkish',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Turkish.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate turkish',
    },
  },
  {
    id: 'd1484846-cba5-4b2b-9fef-0a2d0f4b15b7',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Italian',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Italian.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate italian',
    },
  },
  {
    id: '96248543-4145-4b5c-b4eb-e6398695a24e',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Dutch',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Dutch.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate dutch',
    },
  },
  {
    id: 'f8a45478-0da3-4c34-8306-b922b68fab5b',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Polish',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Polish.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate polish',
    },
  },
  {
    id: 'c78b028f-ae08-4c3b-830b-c71bc03ead25',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Arabic',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Arabic.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate arabic',
    },
  },
  {
    id: 'e361913f-b0af-443f-8122-1affa88478be',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Hebrew',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Hebrew.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate hebrew',
    },
  },
  {
    id: 'd4051326-c55b-4611-944a-3457ff0a8ed7',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Indonesian',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Indonesian.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate indonesian',
    },
  },
  {
    id: 'bf0da9ac-63d5-40f1-a5c5-63f1468ec13c',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Danish',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Danish.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate danish',
    },
  },
  {
    id: '9b1b232b-c036-4131-bd6c-c2e5e690c4ea',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Swedish',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Swedish.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate swedish',
    },
  },
  {
    id: '0d6cce80-546b-4b09-8fe5-f84f195d9d2e',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Filipino',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are proficient in every language, possessing superior translation skills, enabling you to translate from any language to another seamlessly as a native speaker. Your task is to translate the following text, delimited by triple backticks, into Filipino.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs.\n\nIf the original text is in the same language as the target language, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'translate filipino',
    },
  },
  {
    id: '7b26a25c-e869-4832-b5bb-b19685f5c3a5',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Summarize',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              'Ignore all previous instructions. You are a highly proficient researcher that can read and write properly and fluently, and can extract all important information from any text. Your task is to summarize and extract all key takeaways of the following text delimited by triple backticks in all relevant aspects. \n\nOutput a summary and a list of key takeaways respectively. The summary should be a one-liner in at most 100 words. The key takeaways should be in up to seven bulletpoints, the fewer the better.\n\nUse the following format:\n### Summary\n<summary of the text>\n\n### Key Takeaways\n<list of key takeaways>\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```',
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
      icon: 'Summarize',
      searchText: 'generate from selection summarize',
    },
  },
  {
    id: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Translate',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'group',
      actions: [],
      icon: 'Translate',
      searchText: 'generate from selection translate',
    },
  },
  {
    id: '1444ae1f-dbb1-4136-8898-98431ee3a1bb',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Explain this',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a knowledgeable real human that understands everything. Your task is to explain the following text delimited by triple backticks in a very easy-to-understand way. \n\n I want you to pretend to explain the text to a middle school student who has no background knowledge or professional knowledge about the text. You need to output the highest quality explanation possible, including examples and analogies if necessary or helpful.\n\nChoose simple words and phrases to explain. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal.\n\nMake the explanation concise, and keep it under 200 words if possible.\n\nOutput the answer without extra wording, just the explanation itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      icon: 'Question',
      searchText: 'generate from selection explain this',
    },
  },
  {
    id: 'bd4f9e5a-f9d4-4d1c-aab8-43f951739ab0',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Find action items',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              'Ignore all previous instructions. You are a highly proficient researcher that can thoroughly understand any text and distill all crucial tasks embedded within it. Your task is to carefully review the following text delimited by triple backticks and extract all action items from it for the reader.\n\nIdentify only the action items that need the reader to take action, and exclude action items requiring action from anyone other than the reader.\n\nOutput the action items in bulletpoints, and pick a good matching emoji for every bullet point.\n\nUse the following format:\n### Action Items\n<list of action items>\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```',
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
      icon: 'Bulleted',
      searchText: 'generate from selection find action items',
    },
  },
  {
    id: 'c93afaf2-080c-4646-a4dc-5e638f9a0cdb',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Run this prompt',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: '{{SELECTED_TEXT}}',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'PlayArrow',
      searchText: 'generate from selection run this prompt',
    },
  },
  {
    id: '202a7ddd-bea5-46b3-b32c-a0300c7ac1ee',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Professional',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a professional and formal tone.\n\nThe desired tone should be both professional and formal. To clarify:\n- 'Professional' means the language should exude confidence, precision, and clarity, while being devoid of any emotional or casual undertones.\n- 'Formal' means utilizing standard language, avoiding colloquialisms or slang, and maintaining a structured and cohesive flow.\n\nChoose the appropriate degree of professionalism and formality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'change tone professional',
    },
  },
  {
    id: '61404250-a6af-41e2-8b9a-4d6fcfefdb95',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Friendly',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a friendly and approachable tone.\n\nThe desired tone should be both friendly and approachable. To clarify:\n- 'Friendly' means the tone should convey warmth, like you're speaking to a friend. It should be inviting, kind, and free from formal or harsh language. It should make the reader feel welcome and understood.\n- 'Approachable' means the language should be simple and easy to understand. It shouldn't intimidate or alienate the reader, but rather make them feel welcome and encouraged to engage further.\n\nChoose the appropriate degree of friendliness and approachability in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'change tone friendly',
    },
  },
  {
    id: 'ce02e42f-e341-4b94-8bbc-095122507bd2',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Straightforward',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a straightforward and direct tone.\n\nThe desired tone should be both straightforward and direct. To clarify:\n- 'Straightforward' means ensuring that the meaning of the text is easily understood. Use simple language, clear structures, and avoid jargon or complex sentences.\n- 'Direct' means using clear and simple language that goes straight to the point without any unnecessary embellishments.\n\nChoose the appropriate degree of straightforwardness and directness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'change tone straightforward',
    },
  },
  {
    id: '3c3edab4-4125-43ac-89c0-ca95cda06d34',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Confident',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a confident and firm tone.\n\nThe desired tone should be both confident and firm. To clarify:\n- 'Confident' means displaying certainty, full of assurance, and a clear understanding without any hesitation or doubt. Use clear and direct language.\n- 'Firm' means strongly and unwaveringly standing by the message, showcasing decisiveness without being aggressive.\n\nChoose the appropriate degree of confidence and firmness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'change tone confident',
    },
  },
  {
    id: 'df5768a8-448d-4070-afa1-5307838ed965',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Casual',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a casual and informal tone.\n\nThe desired tone should be both casual and informal. To clarify:\n- 'Casual' means writing as if you're talking to a friend or someone of the same age in a light-hearted, relaxed, and easy-going tone. Feel free to use contractions, colloquialisms, and idioms.\n- 'Informal' means using everyday and conversational language. Avoid complex structures and technical terms or jargon unless it's widely understood. Shorten sentences where possible.\n\nChoose the appropriate degree of casualness and informality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      searchText: 'change tone casual',
    },
  },
  {
    id: '4e54395c-5e8b-4bbd-a309-b6057a4737d3',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Improve writing',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a better version of the following text delimited by triple backticks.\n\nYour task means making the text clearer, easier to understand, and well put together, by correcting grammar, spelling, choosing the most suitable punctuation marks, selecting the best tone and style based on the topic and purpose of the text.\n\nChoose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the improved text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      icon: 'AutoFix',
      searchText: 'edit or review selection improve writing',
    },
  },
  {
    id: '496d1369-941d-49a5-a9ce-68eadd7601de',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Fix spelling & grammar',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a highly proficient writer that can read and write properly and fluently. Your task is to proofread and correct the spelling and grammar mistakes of the following text delimited by triple backticks.\n\nMake as few changes as possible. Only correct any spelling or grammar mistakes if the original text has spelling or grammar mistakes. Do not make any writing improvements.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nIf the original text has no spelling or grammar mistakes, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      icon: 'Done',
      searchText: 'edit or review selection fix spelling & grammar',
    },
  },
  {
    id: '547b5b2d-4f7b-4b39-8fdc-524a31659238',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Make shorter',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a shorter version of the following text delimited by triple backticks.\n\nYour task means making the text shorter, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same, if possible. Ensure the re-written text's word count is no more than half the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the shortened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      icon: 'ShortText',
      searchText: 'edit or review selection make shorter',
    },
  },
  {
    id: '1f0b58d6-10cb-4e60-bbc9-10912ca6301c',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Make longer',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a longer version of the following text delimited by triple backticks.\n\nYour task means making the text longer, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the lengthened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      icon: 'LongText',
      searchText: 'edit or review selection make longer',
    },
  },
  {
    id: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Change tone',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'group',
      actions: [],
      icon: 'Voice',
      searchText: 'edit or review selection change tone',
    },
  },
  {
    id: '3ca990dc-b70b-49b5-abfa-eb1dc8e5f271',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Simplify language',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a simplified and easier-to-understand version of the following text delimited by triple backticks.\n\nYour task means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for you to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the simplified text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      icon: 'AutoAwesome',
      searchText: 'edit or review selection simplify language',
    },
  },
  {
    id: '84060107-e962-412b-afa2-f8134e593320',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Paraphrase',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a re-worded version of the following text delimited by triple backticks.\n\nYour task means conveying the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original.\n\nWrite the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the paraphrased text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{SELECTED_TEXT}}\n```",
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
      icon: 'Autorenew',
      searchText: 'edit or review selection paraphrase',
    },
  },
  {
    id: 'b83cb482-710d-4e48-9b22-43b8e8ea3a02',
    parent: 'root',
    droppable: true,
    text: 'Messaging',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [
          'meet.google.com',
          'teams.microsoft.com',
          'web.skype.com',
          'web.snapchat.com',
          'app.hubspot.com',
          'mp.weixin.qq.com',
          'messenger.com',
          'web.telegram.org',
          'app.slack.com',
          'discord.com',
          'web.whatsapp.com',
        ],
        blacklist: [],
        isWhitelistMode: true,
      },
      searchText: 'messaging',
    },
  },
  {
    id: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    parent: 'root',
    droppable: true,
    text: 'Edit or review selection',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'group',
      actions: [],
      searchText: 'edit or review selection',
    },
  },
  {
    id: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    parent: 'root',
    droppable: true,
    text: 'Generate from selection',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'group',
      actions: [],
      searchText: 'generate from selection',
    },
  },
  {
    id: '3cc70e82-29db-45a0-8136-7ba4cf90bf8e',
    parent: 'root',
    droppable: true,
    text: 'Write with AI',
    data: {
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      editable: false,
      type: 'group',
      actions: [],
      searchText: 'write with ai',
    },
  },
] as IContextMenuItem[]
