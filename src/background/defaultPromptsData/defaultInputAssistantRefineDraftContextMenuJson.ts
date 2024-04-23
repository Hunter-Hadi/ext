import { IContextMenuItem } from '@/features/contextMenu/types'

const socialMediaPrompts = [
  {
    id: 'f8c401de-b05f-4ebc-b9f8-75c0cc806458',
    parent: 'b4ad146e-bdb5-4d1e-8c08-7054cb37e577',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'f8c401de-b05f-4ebc-b9f8-75c0cc806458',
              promptName: 'Professional',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone professional',
    },
  },
  {
    id: '09baaec7-ca7d-47ce-8003-6813eeabf2d9',
    parent: 'b4ad146e-bdb5-4d1e-8c08-7054cb37e577',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '09baaec7-ca7d-47ce-8003-6813eeabf2d9',
              promptName: 'Friendly',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone friendly',
    },
  },
  {
    id: 'e39ec032-349c-4e8d-b1d9-a5009531fa72',
    parent: 'b4ad146e-bdb5-4d1e-8c08-7054cb37e577',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'e39ec032-349c-4e8d-b1d9-a5009531fa72',
              promptName: 'Straightforward',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone straightforward',
    },
  },
  {
    id: '532b7d0d-00db-443c-8bdf-b85f49edb938',
    parent: 'b4ad146e-bdb5-4d1e-8c08-7054cb37e577',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '532b7d0d-00db-443c-8bdf-b85f49edb938',
              promptName: 'Confident',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone confident',
    },
  },
  {
    id: '7f44e3b8-a1b2-4dee-b4f7-f4c1e57f1ae7',
    parent: 'b4ad146e-bdb5-4d1e-8c08-7054cb37e577',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '7f44e3b8-a1b2-4dee-b4f7-f4c1e57f1ae7',
              promptName: 'Casual',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone casual',
    },
  },
  {
    id: '1bbb68aa-6d05-456c-a0b5-0ac6a7b580fe',
    parent: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '1bbb68aa-6d05-456c-a0b5-0ac6a7b580fe',
              promptName: 'Improve writing',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'AutoFix',
      searchText: 'edit or review draft improve writing',
    },
  },
  {
    id: '1685485d-e724-4ec6-a033-7ca44509ea8a',
    parent: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '1685485d-e724-4ec6-a033-7ca44509ea8a',
              promptName: 'Fix spelling & grammar',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'Done',
      searchText: 'edit or review draft fix spelling & grammar',
    },
  },
  {
    id: '8b01f015-1782-4fd8-b02f-a5320ef6548c',
    parent: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '8b01f015-1782-4fd8-b02f-a5320ef6548c',
              promptName: 'Make shorter',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'ShortText',
      searchText: 'edit or review draft make shorter',
    },
  },
  {
    id: '5c17966a-ff90-4e8e-9e0d-002bec8e424c',
    parent: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '5c17966a-ff90-4e8e-9e0d-002bec8e424c',
              promptName: 'Make longer',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'LongText',
      searchText: 'edit or review draft make longer',
    },
  },
  {
    id: 'b4ad146e-bdb5-4d1e-8c08-7054cb37e577',
    parent: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
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
      searchText: 'edit or review draft change tone',
    },
  },
  {
    id: 'd514ddcc-1d4d-4a91-82a5-1b2dfa819ce0',
    parent: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'd514ddcc-1d4d-4a91-82a5-1b2dfa819ce0',
              promptName: 'Simplify language',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'AutoAwesome',
      searchText: 'edit or review draft simplify language',
    },
  },
  {
    id: '5c770a88-4c9b-4eff-a9d6-a4e5116fb110',
    parent: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
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
          type: 'GET_SOCIAL_MEDIA_POST_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'POST_DRAFT',
            VariableLabel: 'Post draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '5c770a88-4c9b-4eff-a9d6-a4e5116fb110',
              promptName: 'Paraphrase',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the post',
                  VariableName: 'POST_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'Autorenew',
      searchText: 'edit or review draft paraphrase',
    },
  },
  {
    id: '8ca12784-e40f-4cd6-82eb-14aba0bf8566',
    parent: 'root',
    droppable: true,
    text: 'Edit or review draft',
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
      searchText: 'edit or review draft',
    },
  },
] as IContextMenuItem[]

const emailPrompts = [
  {
    id: '2e2cb2a2-0e5d-4876-828e-5f588f4a2959',
    parent: 'd395c9f7-e5c4-4e47-8566-ab2015a9b9d3',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '2e2cb2a2-0e5d-4876-828e-5f588f4a2959',
              promptName: 'Professional',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone professional',
    },
  },
  {
    id: 'e7f7c44a-d457-414d-a070-9401cd941e67',
    parent: 'd395c9f7-e5c4-4e47-8566-ab2015a9b9d3',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'e7f7c44a-d457-414d-a070-9401cd941e67',
              promptName: 'Friendly',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone friendly',
    },
  },
  {
    id: '73b83253-0068-4444-bd13-4ae4eebd4f56',
    parent: 'd395c9f7-e5c4-4e47-8566-ab2015a9b9d3',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '73b83253-0068-4444-bd13-4ae4eebd4f56',
              promptName: 'Straightforward',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone straightforward',
    },
  },
  {
    id: 'eae1f724-c042-40e9-95a2-f3daed57fe39',
    parent: 'd395c9f7-e5c4-4e47-8566-ab2015a9b9d3',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'eae1f724-c042-40e9-95a2-f3daed57fe39',
              promptName: 'Confident',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone confident',
    },
  },
  {
    id: '86bcf4b4-0ea5-455a-ba4f-7c4fe6f5541c',
    parent: 'd395c9f7-e5c4-4e47-8566-ab2015a9b9d3',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '86bcf4b4-0ea5-455a-ba4f-7c4fe6f5541c',
              promptName: 'Casual',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone casual',
    },
  },
  {
    id: '7a10775d-af4c-47a2-9d97-4af4e5162f73',
    parent: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '7a10775d-af4c-47a2-9d97-4af4e5162f73',
              promptName: 'Improve writing',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'AutoFix',
      searchText: 'edit or review draft improve writing',
    },
  },
  {
    id: '307887d2-8d26-4df7-86fa-18c750dd7728',
    parent: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '307887d2-8d26-4df7-86fa-18c750dd7728',
              promptName: 'Fix spelling & grammar',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'Done',
      searchText: 'edit or review draft fix spelling & grammar',
    },
  },
  {
    id: 'e52105c4-49a0-4676-8beb-02c0675dcf2b',
    parent: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'e52105c4-49a0-4676-8beb-02c0675dcf2b',
              promptName: 'Make shorter',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'ShortText',
      searchText: 'edit or review draft make shorter',
    },
  },
  {
    id: 'c6e02b20-01b0-4bb5-8165-270c5717b84e',
    parent: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'c6e02b20-01b0-4bb5-8165-270c5717b84e',
              promptName: 'Make longer',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'LongText',
      searchText: 'edit or review draft make longer',
    },
  },
  {
    id: 'd395c9f7-e5c4-4e47-8566-ab2015a9b9d3',
    parent: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
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
      searchText: 'edit or review draft change tone',
    },
  },
  {
    id: '3db6f523-526c-45b0-b21c-0c23f996c66a',
    parent: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '3db6f523-526c-45b0-b21c-0c23f996c66a',
              promptName: 'Simplify language',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'AutoAwesome',
      searchText: 'edit or review draft simplify language',
    },
  },
  {
    id: '5695ac2d-9318-4455-b996-f086f10ae6a7',
    parent: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
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
          type: 'GET_EMAIL_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'EMAIL_DRAFT',
            VariableLabel: 'Email draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '5695ac2d-9318-4455-b996-f086f10ae6a7',
              promptName: 'Paraphrase',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The draft of the email',
                  VariableName: 'EMAIL_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'Autorenew',
      searchText: 'edit or review draft paraphrase',
    },
  },
  {
    id: '451284fb-8f5b-4f5a-81c8-f97d20ced787',
    parent: 'root',
    droppable: true,
    text: 'Edit or review draft',
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
      searchText: 'edit or review draft',
    },
  },
] as IContextMenuItem[]

const chatAppPrompts: IContextMenuItem[] = [
  {
    id: '5962ed83-6526-4665-9d94-5c47bc0b931a',
    parent: 'root',
    droppable: true,
    text: 'Edit or review draft',
    data: {
      editable: false,
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
      type: 'group',
      actions: [],
      searchText: 'edit or review draft',
    },
  },
  {
    id: '497bdb9a-79fe-49f9-8071-1c57ff9dedfa',
    parent: '5962ed83-6526-4665-9d94-5c47bc0b931a',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '497bdb9a-79fe-49f9-8071-1c57ff9dedfa',
              promptName: 'Improve writing',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'AutoFix',
      searchText: 'edit or review draft improve writing',
    },
  },
  {
    id: 'dee850cf-f9bc-49f9-adba-f108a1d5dcf5',
    parent: '5962ed83-6526-4665-9d94-5c47bc0b931a',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'dee850cf-f9bc-49f9-adba-f108a1d5dcf5',
              promptName: 'Fix spelling & grammar',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'Done',
      searchText: 'edit or review draft fix spelling & grammar',
    },
  },
  {
    id: 'f9014c9d-d855-45cf-afb3-d18da9a5db9c',
    parent: '5962ed83-6526-4665-9d94-5c47bc0b931a',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'f9014c9d-d855-45cf-afb3-d18da9a5db9c',
              promptName: 'Make shorter',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'ShortText',
      searchText: 'edit or review draft make shorter',
    },
  },
  {
    id: 'ee7455db-3321-49ba-943b-6a028ab35a30',
    parent: '5962ed83-6526-4665-9d94-5c47bc0b931a',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'ee7455db-3321-49ba-943b-6a028ab35a30',
              promptName: 'Make longer',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'LongText',
      searchText: 'edit or review draft make longer',
    },
  },
  {
    id: 'b5535869-778d-45a5-818b-36863df2fe2e',
    parent: '5962ed83-6526-4665-9d94-5c47bc0b931a',
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
      searchText: 'edit or review draft change tone',
    },
  },
  {
    id: 'c42f469c-69e8-49df-9bbd-031ab9ca4ec6',
    parent: 'b5535869-778d-45a5-818b-36863df2fe2e',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: 'c42f469c-69e8-49df-9bbd-031ab9ca4ec6',
              promptName: 'Professional',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone professional',
    },
  },
  {
    id: '19fab05d-02df-46bb-a0f4-38ee37c1a63f',
    parent: 'b5535869-778d-45a5-818b-36863df2fe2e',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '19fab05d-02df-46bb-a0f4-38ee37c1a63f',
              promptName: 'Friendly',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone friendly',
    },
  },
  {
    id: '82c62432-4f36-4604-95a6-352d7c39f68e',
    parent: 'b5535869-778d-45a5-818b-36863df2fe2e',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '82c62432-4f36-4604-95a6-352d7c39f68e',
              promptName: 'Straightforward',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone straightforward',
    },
  },
  {
    id: '37a76900-1d0f-44e5-8ef9-6fbfa5b57fb7',
    parent: 'b5535869-778d-45a5-818b-36863df2fe2e',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '37a76900-1d0f-44e5-8ef9-6fbfa5b57fb7',
              promptName: 'Confident',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone confident',
    },
  },
  {
    id: '78ca6afd-1d5a-4c50-b925-c4ff5277243b',
    parent: 'b5535869-778d-45a5-818b-36863df2fe2e',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '78ca6afd-1d5a-4c50-b925-c4ff5277243b',
              promptName: 'Casual',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      searchText: 'change tone casual',
    },
  },
  {
    id: '4502abad-c5cc-4c50-8e51-9d45e049ad84',
    parent: '5962ed83-6526-4665-9d94-5c47bc0b931a',
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
          type: 'GET_CHAT_MESSAGE_DRAFT_OF_WEBPAGE',
          parameters: {},
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
            VariableName: 'MESSAGE_DRAFT',
            VariableLabel: 'Message draft',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {
            MaxAIPromptActionConfig: {
              promptId: '4502abad-c5cc-4c50-8e51-9d45e049ad84',
              promptName: 'Simplify language',
              promptActionType: 'chat_complete',
              variables: [
                {
                  label: 'The domain of the current website',
                  VariableName: 'CURRENT_WEBSITE_DOMAIN',
                  valueType: 'Text',
                },
                {
                  label: 'Message draft',
                  VariableName: 'MESSAGE_DRAFT',
                  valueType: 'Text',
                },
                {
                  label: 'The language preference',
                  VariableName: 'AI_RESPONSE_LANGUAGE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing style preference',
                  VariableName: 'AI_RESPONSE_WRITING_STYLE',
                  valueType: 'Text',
                },
                {
                  label: 'The writing tone preference',
                  VariableName: 'AI_RESPONSE_TONE',
                  valueType: 'Text',
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
      icon: 'AutoAwesome',
      searchText: 'edit or review draft simplify language',
    },
  },
]

export default [
  ...emailPrompts,
  ...socialMediaPrompts,
  ...chatAppPrompts,
] as IContextMenuItem[]
