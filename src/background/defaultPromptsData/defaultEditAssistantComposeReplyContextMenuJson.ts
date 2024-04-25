import { IContextMenuItem } from '@/features/contextMenu/types'
// 社交媒体
const socialMediaPrompts = [
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '26f44f32-cbe8-4832-9049-7b64aa2198fb',
              promptName: 'Like',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply like',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '31d488a9-0d16-48ce-b865-6c7667ebf573',
              promptName: 'Love',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply love',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '1d93656a-fbf0-4650-b3b9-e735b36caca3',
              promptName: 'Thanks',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply thanks',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'bda41b5f-2985-4dd2-8b09-3bb958ab24d9',
              promptName: 'Care',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply care',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '115cbff4-aeb5-49f5-884c-09971d39314e',
              promptName: 'Joke',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply joke',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'bdbd5e9e-355b-4563-bd8d-74e7586fdbdd',
              promptName: 'Wow',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply wow',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '0f6ba970-ed50-4d03-8582-29d4561ea2b6',
              promptName: 'Sad',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply sad',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '730b1b2d-809b-428b-9967-9c3b53154bbf',
              promptName: 'Dislike',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'The target social media post or comment',
                  VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply dislike',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: '{{SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT}}',
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
            WFConditionalIfTrueActions: [
              {
                type: 'SET_VARIABLES_MODAL',
                parameters: {
                  MaxAIPromptActionConfig: {
                    promptId: '9a65c4c0-c2b8-4fe1-a85e-0e2d84682eb1',
                    promptName: 'Reply with key points',
                    promptActionType: 'chat_complete',
                    variables: [
                      {
                        label: 'Target post/comment',
                        VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                        valueType: 'Text',
                        placeholder: 'Enter target post/comment',
                        defaultValue: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENT}}',
                      },
                      {
                        label: 'Key points',
                        VariableName: 'KEY_POINTS',
                        valueType: 'Text',
                        placeholder: 'Enter key points',
                      },
                      {
                        label: 'The domain of the current website',
                        VariableName: 'CURRENT_WEBSITE_DOMAIN',
                        valueType: 'Text',
                        systemVariable: true,
                        hidden: true,
                      },
                      {
                        label: 'AI Response language',
                        VariableName: 'AI_RESPONSE_LANGUAGE',
                        defaultValue: 'English',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Tone',
                        VariableName: 'AI_RESPONSE_TONE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Writing style',
                        VariableName: 'AI_RESPONSE_WRITING_STYLE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                    ],
                    output: [
                      {
                        label: 'The completion string from the LLM',
                        VariableName: 'ChatComplete',
                        valueType: 'Text',
                      },
                    ],
                  },
                  SetVariablesModalConfig: {
                    contextMenuId: '9a65c4c0-c2b8-4fe1-a85e-0e2d84682eb1',
                    title: 'Reply with key points',
                    variables: [],
                    systemVariables: [],
                  },
                },
              },
            ],
            WFConditionalIfFalseActions: [
              {
                type: 'SET_VARIABLES_MODAL',
                parameters: {
                  MaxAIPromptActionConfig: {
                    promptId: '9a65c4c0-c2b8-4fe1-a85e-0e2d84682eb1',
                    promptName: 'Reply with key points',
                    promptActionType: 'chat_complete',
                    variables: [
                      {
                        label: 'Context',
                        VariableName: 'SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT',
                        valueType: 'Text',
                        placeholder: 'Enter context',
                        defaultValue:
                          '{{SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT}}',
                        systemVariable: true,
                      },
                      {
                        label: 'Target post/comment',
                        VariableName: 'SOCIAL_MEDIA_TARGET_POST_OR_COMMENT',
                        valueType: 'Text',
                        placeholder: 'Enter target post/comment',
                        defaultValue: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENT}}',
                      },
                      {
                        label: 'Key points',
                        VariableName: 'KEY_POINTS',
                        valueType: 'Text',
                        placeholder: 'Enter key points',
                      },
                      {
                        label: 'The domain of the current website',
                        VariableName: 'CURRENT_WEBSITE_DOMAIN',
                        valueType: 'Text',
                        systemVariable: true,
                        hidden: true,
                      },
                      {
                        label: 'AI Response language',
                        VariableName: 'AI_RESPONSE_LANGUAGE',
                        defaultValue: 'English',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Tone',
                        VariableName: 'AI_RESPONSE_TONE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Writing style',
                        VariableName: 'AI_RESPONSE_WRITING_STYLE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                    ],
                    output: [
                      {
                        label: 'The completion string from the LLM',
                        VariableName: 'ChatComplete',
                        valueType: 'Text',
                      },
                    ],
                  },
                  SetVariablesModalConfig: {
                    contextMenuId: '9a65c4c0-c2b8-4fe1-a85e-0e2d84682eb1',
                    title: 'Reply with key points',
                    variables: [],
                    systemVariables: [],
                  },
                },
              },
            ],
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
    id: '3df7e144-272e-4e7e-9ba4-06cc3dd9584d',
    parent: 'root',
    droppable: true,
    text: 'Instant reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
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
      searchText: 'social media instant reply',
      icon: 'Reply',
    },
  },
] as IContextMenuItem[]

// 邮件
const emailPrompts = [
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
          parameters: {
            isVariableMiddleOutEnabled: true,
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
              key: 'SLICE_EMAIL_CONTEXT',
              value: `{{LAST_ACTION_OUTPUT}}`,
              label: 'Slice email context',
              overwrite: true,
              isBuiltIn: true,
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '55a875ba-c2a7-449a-8af8-36c361e8def0',
              promptName: 'Yes',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the sliced email',
                  VariableName: 'SLICE_EMAIL_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply yes',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
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
              key: 'SLICE_EMAIL_CONTEXT',
              value: `{{LAST_ACTION_OUTPUT}}`,
              label: 'Slice email context',
              overwrite: true,
              isBuiltIn: true,
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'ac69b62c-b8f7-4052-ad4d-4923325a1ba4',
              promptName: 'No',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the sliced email',
                  VariableName: 'SLICE_EMAIL_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply no',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
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
              key: 'SLICE_EMAIL_CONTEXT',
              value: `{{LAST_ACTION_OUTPUT}}`,
              label: 'Slice email context',
              overwrite: true,
              isBuiltIn: true,
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'ab57ed6e-3363-4f71-85ef-be17fdf086e3',
              promptName: 'Thanks',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the sliced email',
                  VariableName: 'SLICE_EMAIL_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply thanks',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
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
              key: 'SLICE_EMAIL_CONTEXT',
              value: `{{LAST_ACTION_OUTPUT}}`,
              label: 'Slice email context',
              overwrite: true,
              isBuiltIn: true,
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'c7171cca-7db0-46bb-8357-036068ec50db',
              promptName: 'Sorry',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the sliced email',
                  VariableName: 'SLICE_EMAIL_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply sorry',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
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
              key: 'SLICE_EMAIL_CONTEXT',
              value: `{{LAST_ACTION_OUTPUT}}`,
              label: 'Slice email context',
              overwrite: true,
              isBuiltIn: true,
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'ec19a0f6-346b-4d8f-bfab-8a88aa3760f2',
              promptName: 'More info',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the sliced email',
                  VariableName: 'SLICE_EMAIL_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply more info',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
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
              key: 'SLICE_EMAIL_CONTEXT',
              value: `{{LAST_ACTION_OUTPUT}}`,
              label: 'Slice email context',
              overwrite: true,
              isBuiltIn: true,
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'b1cd46eb-ca76-437e-841e-f7714aaea215',
              promptName: 'Joke',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the sliced email',
                  VariableName: 'SLICE_EMAIL_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply joke',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
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
              key: 'SLICE_EMAIL_CONTEXT',
              value: `{{LAST_ACTION_OUTPUT}}`,
              label: 'Slice email context',
              overwrite: true,
              isBuiltIn: true,
            },
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'eeb8c14c-b058-42ac-a7dd-6e78d74264a2',
              promptName: 'Follow-up',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'The context of the sliced email',
                  VariableName: 'SLICE_EMAIL_CONTEXT',
                  valueType: 'Text',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply follow-up',
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
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: '{{EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT}}',
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
            WFConditionalIfTrueActions: [
              {
                type: 'SET_VARIABLES_MODAL',
                parameters: {
                  MaxAIPromptActionConfig: {
                    promptId: '47070ec6-8700-43fd-a519-20fe3841df38',
                    promptName: 'Reply with key points',
                    promptActionType: 'chat_complete',
                    variables: [
                      {
                        label: 'Email context',
                        VariableName:
                          'EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT',
                        valueType: 'Text',
                        placeholder: 'Enter email context',
                        defaultValue:
                          '{{EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT}}',
                        systemVariable: true,
                        hidden: true,
                      },
                      {
                        label: 'Target email',
                        VariableName:
                          'EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT',
                        valueType: 'Text',
                        placeholder: 'Enter email context',
                        defaultValue:
                          '{{EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT}}',
                      },
                      {
                        label: 'Key points',
                        VariableName: 'KEY_POINTS',
                        valueType: 'Text',
                        placeholder: 'Enter key points',
                      },
                      {
                        label: 'AI Response language',
                        VariableName: 'AI_RESPONSE_LANGUAGE',
                        defaultValue: 'English',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Tone',
                        VariableName: 'AI_RESPONSE_TONE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Writing style',
                        VariableName: 'AI_RESPONSE_WRITING_STYLE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                    ],
                    output: [
                      {
                        label: 'The completion string from the LLM',
                        VariableName: 'ChatComplete',
                        valueType: 'Text',
                      },
                    ],
                  },
                  SetVariablesModalConfig: {
                    contextMenuId: '47070ec6-8700-43fd-a519-20fe3841df38',
                    title: 'Reply with key points',
                    variables: [],
                    systemVariables: [],
                  },
                },
              },
            ],
            WFConditionalIfFalseActions: [
              {
                type: 'SET_VARIABLES_MODAL',
                parameters: {
                  MaxAIPromptActionConfig: {
                    promptId: '47070ec6-8700-43fd-a519-20fe3841df38',
                    promptName: 'Reply with key points',
                    promptActionType: 'chat_complete',
                    variables: [
                      {
                        label: 'Email context',
                        VariableName:
                          'EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT',
                        valueType: 'Text',
                        placeholder: 'Enter email context',
                        defaultValue:
                          '{{EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT}}',
                        systemVariable: true,
                      },
                      {
                        label: 'Target email',
                        VariableName:
                          'EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT',
                        valueType: 'Text',
                        placeholder: 'Enter email context',
                        defaultValue:
                          '{{EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT}}',
                      },
                      {
                        label: 'Key points',
                        VariableName: 'KEY_POINTS',
                        valueType: 'Text',
                        placeholder: 'Enter key points',
                      },
                      {
                        label: 'AI Response language',
                        VariableName: 'AI_RESPONSE_LANGUAGE',
                        defaultValue: 'English',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Tone',
                        VariableName: 'AI_RESPONSE_TONE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Writing style',
                        VariableName: 'AI_RESPONSE_WRITING_STYLE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                    ],
                    output: [
                      {
                        label: 'The completion string from the LLM',
                        VariableName: 'ChatComplete',
                        valueType: 'Text',
                      },
                    ],
                  },
                  SetVariablesModalConfig: {
                    contextMenuId: '47070ec6-8700-43fd-a519-20fe3841df38',
                    title: 'Reply with key points',
                    variables: [],
                    systemVariables: [],
                  },
                },
              },
            ],
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
    id: 'cf4e0b8e-a5da-4d4f-8244-c748466e7c35',
    parent: 'root',
    droppable: true,
    text: 'Instant reply',
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
      searchText: 'email instant reply',
      icon: 'Reply',
    },
  },
] as IContextMenuItem[]

const chatAppPrompts: IContextMenuItem[] = [
  {
    id: 'd77238eb-7673-46c2-a019-5bab341815fe',
    parent: 'root',
    droppable: true,
    text: 'Instant reply',
    data: {
      editable: false,
      type: 'group',
      actions: [],
      visibility: {
        whitelist: [
          'discord.com',
          'app.slack.com',
          'web.whatsapp.com',
          'web.telegram.org',
        ],
        blacklist: [],
        isWhitelistMode: true,
      },
      searchText: 'social media instant reply',
      icon: 'Reply',
    },
  },
  {
    id: '3e7f564c-505d-4441-a8bc-8ae59bfec52c',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Like',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '3e7f564c-505d-4441-a8bc-8ae59bfec52c',
              promptName: 'Like',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply like',
    },
  },
  {
    id: 'e6043507-dbc0-444e-8d50-b3875453054d',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Love',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'e6043507-dbc0-444e-8d50-b3875453054d',
              promptName: 'Love',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply love',
    },
  },
  {
    id: '129ac9e5-ab42-40a7-aa3e-a00cbc0c17d0',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Thanks',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '129ac9e5-ab42-40a7-aa3e-a00cbc0c17d0',
              promptName: 'Thanks',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply thanks',
    },
  },
  {
    id: '75eacdf2-ea75-4d18-9e7b-f3286a373aa0',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Care',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '75eacdf2-ea75-4d18-9e7b-f3286a373aa0',
              promptName: 'Care',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply care',
    },
  },
  {
    id: '75c2e1c4-f723-483e-a764-2a7a42a69ea8',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Joke',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '75c2e1c4-f723-483e-a764-2a7a42a69ea8',
              promptName: 'Joke',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply joke',
    },
  },
  {
    id: '2ac76fc3-6330-4dee-9411-98687ed778ae',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Wow',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '2ac76fc3-6330-4dee-9411-98687ed778ae',
              promptName: 'Wow',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply wow',
    },
  },
  {
    id: '2358037c-9e2c-4bed-b72f-69629d703e7b',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Sad',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '2358037c-9e2c-4bed-b72f-69629d703e7b',
              promptName: 'Sad',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply sad',
    },
  },
  {
    id: 'e72b2a5f-8b38-4ba7-a731-267f452bdfbb',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Dislike',
    data: {
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'e72b2a5f-8b38-4ba7-a731-267f452bdfbb',
              promptName: 'Dislike',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                  systemVariable: true,
                  hidden: true,
                },
                {
                  label: 'Context',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                  valueType: 'Text',
                  placeholder: 'Enter context',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                  systemVariable: true,
                },
                {
                  label: 'Target message',
                  VariableName:
                    'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                  valueType: 'Text',
                  placeholder: 'Enter target message',
                  defaultValue:
                    '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                },
                {
                  label: 'AI Response language',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Writing style',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                  systemVariable: true,
                },
                {
                  label: 'Tone',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
                  systemVariable: true,
                },
              ],
              output: [
                {
                  label: 'The completion string from the LLM',
                  VariableName: 'ChatComplete',
                  valueType: 'Text',
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
      searchText: 'instant reply dislike',
    },
  },
  {
    id: 'b5381aa7-5ba3-4f96-a696-c694da938ef2',
    parent: 'd77238eb-7673-46c2-a019-5bab341815fe',
    droppable: true,
    text: 'Reply with key points',
    data: {
      icon: 'DefaultIcon',
      editable: false,
      type: 'shortcuts',
      actions: [
        {
          type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
          parameters: {
            isVariableMiddleOutEnabled: true,
          },
        },
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
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
            WFConditionalIfTrueActions: [
              {
                type: 'SET_VARIABLES_MODAL',
                parameters: {
                  MaxAIPromptActionConfig: {
                    promptId: 'b5381aa7-5ba3-4f96-a696-c694da938ef2',
                    promptName: 'Reply with key points',
                    promptActionType: 'chat_complete',
                    variables: [
                      {
                        label: 'The domain of the current website',
                        VariableName: 'CURRENT_WEBSITE_DOMAIN',
                        valueType: 'Text',
                        systemVariable: true,
                        hidden: true,
                      },
                      {
                        label: 'Target message',
                        VariableName:
                          'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                        valueType: 'Text',
                        placeholder: 'Enter target message',
                        defaultValue:
                          '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                      },
                      {
                        label: 'Key points',
                        VariableName: 'KEY_POINTS',
                        valueType: 'Text',
                        placeholder: 'Enter key points',
                      },
                      {
                        label: 'AI Response language',
                        VariableName: 'AI_RESPONSE_LANGUAGE',
                        defaultValue: 'English',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Tone',
                        VariableName: 'AI_RESPONSE_TONE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Writing style',
                        VariableName: 'AI_RESPONSE_WRITING_STYLE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                    ],
                    output: [
                      {
                        label: 'The completion string from the LLM',
                        VariableName: 'ChatComplete',
                        valueType: 'Text',
                      },
                    ],
                  },
                  SetVariablesModalConfig: {
                    contextMenuId: 'b5381aa7-5ba3-4f96-a696-c694da938ef2',
                    title: 'Reply with key points',
                    variables: [],
                    systemVariables: [],
                  },
                },
              },
            ],
            WFConditionalIfFalseActions: [
              {
                type: 'SET_VARIABLES_MODAL',
                parameters: {
                  MaxAIPromptActionConfig: {
                    promptId: 'b5381aa7-5ba3-4f96-a696-c694da938ef2',
                    promptName: 'Reply with key points',
                    promptActionType: 'chat_complete',
                    variables: [
                      {
                        label: 'The domain of the current website',
                        VariableName: 'CURRENT_WEBSITE_DOMAIN',
                        valueType: 'Text',
                        systemVariable: true,
                        hidden: true,
                      },
                      {
                        label: 'Context',
                        VariableName:
                          'MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT',
                        valueType: 'Text',
                        placeholder: 'Enter context',
                        defaultValue:
                          '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
                        systemVariable: true,
                      },
                      {
                        label: 'Target message',
                        VariableName:
                          'MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT',
                        valueType: 'Text',
                        placeholder: 'Enter target message',
                        defaultValue:
                          '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
                      },
                      {
                        label: 'Key points',
                        VariableName: 'KEY_POINTS',
                        valueType: 'Text',
                        placeholder: 'Enter key points',
                      },
                      {
                        label: 'AI Response language',
                        VariableName: 'AI_RESPONSE_LANGUAGE',
                        defaultValue: 'English',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Tone',
                        VariableName: 'AI_RESPONSE_TONE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                      {
                        label: 'Writing style',
                        VariableName: 'AI_RESPONSE_WRITING_STYLE',
                        defaultValue: 'Default',
                        valueType: 'Select',
                        systemVariable: true,
                      },
                    ],
                    output: [
                      {
                        label: 'The completion string from the LLM',
                        VariableName: 'ChatComplete',
                        valueType: 'Text',
                      },
                    ],
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
]
export default [
  ...emailPrompts,
  ...socialMediaPrompts,
  ...chatAppPrompts,
] as IContextMenuItem[]
