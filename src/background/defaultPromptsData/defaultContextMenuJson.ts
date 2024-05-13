import {
  OUTPUT_CHAT_COMPLETE,
  VARIABLE_AI_RESPONSE_LANGUAGE,
  VARIABLE_AI_RESPONSE_TONE,
  VARIABLE_AI_RESPONSE_WRITING_STYLE,
  VARIABLE_CURRENT_WEBSITE_DOMAIN,
  VARIABLE_SELECTED_TEXT,
} from '@/background/defaultPromptsData/systemVariables'
import { IContextMenuItem } from '@/features/contextMenu/types'

export default [
  {
    id: 'c769f823-a073-408a-ac44-00e5bfc333a7',
    parent: 'b83cb482-710d-4e48-9b22-43b8e8ea3a02',
    droppable: true,
    text: 'Instant reply',
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
      searchText: 'messaging instant reply',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '0607ffb9-e0fb-41b5-9e02-afabff22acb6',
              promptName: 'Like',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply like',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '2822ad40-9f2c-4db8-961b-50636218edc7',
              promptName: 'Love',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply love',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '4d59573b-7e84-4fb0-8d55-582bd4a5c948',
              promptName: 'Thanks',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply thanks',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '6325c4b4-5b4c-457b-849a-eacdcb37edfb',
              promptName: 'Care',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply care',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '32dd4492-4ec4-44a9-ba53-32223bf385fe',
              promptName: 'Joke',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply joke',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '5bb90f56-7cae-4662-9d59-dd2c6ff941ec',
              promptName: 'Wow',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply wow',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'c4f861da-75ee-4afb-86a7-de234c0c2309',
              promptName: 'Sad',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply sad',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '31e2d82e-5176-43a5-af28-33b873f27496',
              promptName: 'Dislike',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply dislike',
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
            MaxAIPromptActionConfig: {
              promptId: '32f31576-0ab8-4fc8-966d-426970abede6',
              promptName: 'Reply with key points',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'Context',
                  VariableName: 'CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue: '{{SELECTED_TEXT}}',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Key points',
                  VariableName: 'KEY_POINTS',
                  valueType: 'Text',
                  placeholder: 'Enter key points',
                },
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_TONE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
            SetVariablesModalConfig: {
              title: 'Reply with key points',
              contextMenuId: '32f31576-0ab8-4fc8-966d-426970abede6',
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
      searchText: 'instant reply reply with key points',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'a261c7e0-1a4f-485f-a9e0-9998c45cd08c',
              promptName: 'Yes',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply yes',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '5b4fb377-411b-497b-89d8-045603632f08',
              promptName: 'No',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply no',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '8a12f88f-9216-4e92-ad41-b4f55c4cfc2b',
              promptName: 'Thanks',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply thanks',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'f20dcaf5-5133-4046-b129-174f49d0d16c',
              promptName: 'Sorry',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply sorry',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '016adb2d-794e-41ae-9da7-b80a2fc146ca',
              promptName: 'More info',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply more info',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '379124bc-8db4-4b62-b453-cd8e8ab3523e',
              promptName: 'Joke',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply joke',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '370bca5c-6e3e-4daa-96ac-070ffe8af179',
              promptName: 'Follow-up',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply follow-up',
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
            MaxAIPromptActionConfig: {
              promptId: '0815c986-5bd2-49a7-a62f-eeb2c49907da',
              promptName: 'Reply with key points',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                {
                  label: 'Email context',
                  VariableName: 'CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter email context',
                  defaultValue: '{{SELECTED_TEXT}}',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Key points',
                  VariableName: 'KEY_POINTS',
                  valueType: 'Text',
                  placeholder: 'Enter key points',
                },
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_TONE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
            SetVariablesModalConfig: {
              contextMenuId: '0815c986-5bd2-49a7-a62f-eeb2c49907da',
              title: 'Reply with key points',
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
      searchText: 'instant reply reply with key points',
    },
  },
  {
    id: '665d4c2f-0f17-43be-9a49-a65ace4ef4e7',
    parent: '5faf9b14-f2c3-4d3c-a43b-ab9f6e4747b1',
    droppable: true,
    text: 'Instant reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'email instant reply',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '4f3d7b3b-62e5-4e88-bd79-01efd7ef0bd0',
              promptName: 'Like',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply like',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '8294f143-2727-4de6-9065-12358f87a7bd',
              promptName: 'Love',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply love',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '3e4d313f-8a15-48b2-beb9-1f05f93b4d4f',
              promptName: 'Thanks',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply thanks',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '176a963c-849e-4cd7-8bf3-84e4531f0cc0',
              promptName: 'Care',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply care',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '0486d1dc-b6bd-4c9b-a861-660e1f87f621',
              promptName: 'Joke',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply joke',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '93c3fd09-315d-447d-bbdf-052a78511f39',
              promptName: 'Wow',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply wow',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'c4ed94fc-d8cc-4633-b563-4a94582ab58c',
              promptName: 'Sad',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply sad',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'd426af1d-4055-4ada-b359-648b9ada81e7',
              promptName: 'Dislike',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'instant reply dislike',
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
            MaxAIPromptActionConfig: {
              promptId: '6e14fd11-a06e-40b3-97d5-3fc0515288b0',
              promptName: 'Reply with key points',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_CURRENT_WEBSITE_DOMAIN,
                {
                  label: 'Context',
                  VariableName: 'CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue: '{{SELECTED_TEXT}}',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Key points',
                  VariableName: 'KEY_POINTS',
                  valueType: 'Text',
                  placeholder: 'Enter key points',
                },
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_TONE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
            SetVariablesModalConfig: {
              contextMenuId: '6e14fd11-a06e-40b3-97d5-3fc0515288b0',
              title: 'Reply with key points',
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
      searchText: 'instant reply reply with key points',
    },
  },
  {
    id: 'aa4d2d42-28a6-4a2f-a67d-2805f4307fd9',
    parent: '4d7c6a66-1905-43c1-826b-0b8201461d47',
    droppable: true,
    text: 'Instant reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [],
        blacklist: [],
        isWhitelistMode: false,
      },
      searchText: 'social media instant reply',
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
            template: '{{SELECTED_TEXT}}',
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
            Variable: {
              key: `MAXAI_CONTINUE_WRITING_TEXT_DRAFT`,
              value: `{{LAST_ACTION_OUTPUT}}`,
              isBuiltIn: true,
              overwrite: true,
              label: 'Continue writing text draft',
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'c0f7a642-9e34-4b1f-a2ee-1c4c5e93fa23',
              promptName: 'Continue writing',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The draft text for continuation in MaxAI',
                  VariableName: 'MAXAI_CONTINUE_WRITING_TEXT_DRAFT',
                  valueType: 'text',
                },
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'b517f321-5533-41e5-8ed0-64eb6aa4b7bd',
              promptName: 'English',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'e5a30298-52e9-431d-89d8-6f5431c236c9',
              promptName: 'Chinese (Simplified)',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '0cb5746c-b879-4ac4-86fb-49f366c81542',
              promptName: 'Chinese (Traditional)',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '481f6d4a-9045-4cd0-b5e7-1eec6822bed3',
              promptName: 'Portuguese',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '1aabb1d3-f1af-4e81-aab9-fe4d16630cc3',
              promptName: 'Spanish',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'ad6cebdb-c5ab-4db5-8776-95d6381b90de',
              promptName: 'French',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '6de2edc2-019f-4a6c-9051-a15aa11338a0',
              promptName: 'Korean',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '24766e7e-a419-4992-aaaf-786a37a0e111',
              promptName: 'Vietnamese',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '2a753c24-a5cb-496a-a34b-1037e366e690',
              promptName: 'Japanese',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '3aca0447-12a5-4453-b4b2-64e45f16598a',
              promptName: 'Russian',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '8b6f4e3f-7669-44a8-a020-fb88c5c9d592',
              promptName: 'German',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'fee4c3e1-8970-436a-a535-e6085f283973',
              promptName: 'Turkish',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'd1484846-cba5-4b2b-9fef-0a2d0f4b15b7',
              promptName: 'Italian',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '96248543-4145-4b5c-b4eb-e6398695a24e',
              promptName: 'Dutch',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'f8a45478-0da3-4c34-8306-b922b68fab5b',
              promptName: 'Polish',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'c78b028f-ae08-4c3b-830b-c71bc03ead25',
              promptName: 'Arabic',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'e361913f-b0af-443f-8122-1affa88478be',
              promptName: 'Hebrew',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'd4051326-c55b-4611-944a-3457ff0a8ed7',
              promptName: 'Indonesian',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'bf0da9ac-63d5-40f1-a5c5-63f1468ec13c',
              promptName: 'Danish',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '9b1b232b-c036-4131-bd6c-c2e5e690c4ea',
              promptName: 'Swedish',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '0d6cce80-546b-4b09-8fe5-f84f195d9d2e',
              promptName: 'Filipino',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      searchText: 'translate filipino',
    },
  },
  {
    id: '2628ad04-86f3-4306-a8bf-5c6a4e7cfbc6',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Norwegian',
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '2628ad04-86f3-4306-a8bf-5c6a4e7cfbc6',
              promptName: 'Norwegian',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      searchText: 'translate norwegian',
    },
  },
  {
    id: '8f877635-6585-4de0-9a7d-812a2e987ab2',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Suomi',
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: '8f877635-6585-4de0-9a7d-812a2e987ab2',
              promptName: 'Suomi',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      searchText: 'translate suomi finnish',
    },
  },
  {
    id: 'bc8e3fbc-13ab-4150-b748-93c1bd60969d',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Czech',
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
          type: 'ASK_CHATGPT',
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
            MaxAIPromptActionConfig: {
              promptId: 'bc8e3fbc-13ab-4150-b748-93c1bd60969d',
              promptName: 'Czech',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
          },
        },
      ],
      searchText: 'translate czech',
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '7b26a25c-e869-4832-b5bb-b19685f5c3a5',
              promptName: 'Summarize',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '1444ae1f-dbb1-4136-8898-98431ee3a1bb',
              promptName: 'Explain this',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'bd4f9e5a-f9d4-4d1c-aab8-43f951739ab0',
              promptName: 'Find action items',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          parameters: {
            isEnabledDetectAIResponseLanguage: false,
          },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '202a7ddd-bea5-46b3-b32c-a0300c7ac1ee',
              promptName: 'Professional',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '61404250-a6af-41e2-8b9a-4d6fcfefdb95',
              promptName: 'Friendly',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'ce02e42f-e341-4b94-8bbc-095122507bd2',
              promptName: 'Straightforward',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '3c3edab4-4125-43ac-89c0-ca95cda06d34',
              promptName: 'Confident',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'df5768a8-448d-4070-afa1-5307838ed965',
              promptName: 'Casual',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '4e54395c-5e8b-4bbd-a309-b6057a4737d3',
              promptName: 'Improve writing',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '496d1369-941d-49a5-a9ce-68eadd7601de',
              promptName: 'Fix spelling & grammar',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '547b5b2d-4f7b-4b39-8fdc-524a31659238',
              promptName: 'Make shorter',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '1f0b58d6-10cb-4e60-bbc9-10912ca6301c',
              promptName: 'Make longer',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '3ca990dc-b70b-49b5-abfa-eb1dc8e5f271',
              promptName: 'Simplify language',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '84060107-e962-412b-afa2-f8134e593320',
              promptName: 'Paraphrase',
              promptActionType: 'chat_complete',
              variables: [
                VARIABLE_SELECTED_TEXT,
                VARIABLE_AI_RESPONSE_LANGUAGE,
                VARIABLE_AI_RESPONSE_WRITING_STYLE,
                VARIABLE_AI_RESPONSE_TONE,
              ],
              output: [OUTPUT_CHAT_COMPLETE],
            },
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
