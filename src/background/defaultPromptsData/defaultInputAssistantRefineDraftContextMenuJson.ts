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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a professional and formal tone.\n\nThe desired tone should be both professional and formal. To clarify:\n- 'Professional' means the language should exude confidence, precision, and clarity, while being devoid of any emotional or casual undertones.\n- 'Formal' means utilizing standard language, avoiding colloquialisms or slang, and maintaining a structured and cohesive flow.\n\nChoose the appropriate degree of professionalism and formality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a friendly and approachable tone.\n\nThe desired tone should be both friendly and approachable. To clarify:\n- 'Friendly' means the tone should convey warmth, like you're speaking to a friend. It should be inviting, kind, and free from formal or harsh language. It should make the reader feel welcome and understood.\n- 'Approachable' means the language should be simple and easy to understand. It shouldn't intimidate or alienate the reader, but rather make them feel welcome and encouraged to engage further.\n\nChoose the appropriate degree of friendliness and approachability in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a straightforward and direct tone.\n\nThe desired tone should be both straightforward and direct. To clarify:\n- 'Straightforward' means ensuring that the meaning of the text is easily understood. Use simple language, clear structures, and avoid jargon or complex sentences.\n- 'Direct' means using clear and simple language that goes straight to the point without any unnecessary embellishments.\n\nChoose the appropriate degree of straightforwardness and directness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a confident and firm tone.\n\nThe desired tone should be both confident and firm. To clarify:\n- 'Confident' means displaying certainty, full of assurance, and a clear understanding without any hesitation or doubt. Use clear and direct language.\n- 'Firm' means strongly and unwaveringly standing by the message, showcasing decisiveness without being aggressive.\n\nChoose the appropriate degree of confidence and firmness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a casual and informal tone.\n\nThe desired tone should be both casual and informal. To clarify:\n- 'Casual' means writing as if you're talking to a friend or someone of the same age in a light-hearted, relaxed, and easy-going tone. Feel free to use contractions, colloquialisms, and idioms.\n- 'Informal' means using everyday and conversational language. Avoid complex structures and technical terms or jargon unless it's widely understood. Shorten sentences where possible.\n\nChoose the appropriate degree of casualness and informality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a better version of the following text delimited by triple backticks.\n\nYour task means making the text clearer, easier to understand, and well put together, by correcting grammar, spelling, choosing the most suitable punctuation marks, selecting the best tone and style based on the topic and purpose of the text.\n\nChoose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the improved text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a highly proficient writer that can read and write properly and fluently. Your task is to proofread and correct the spelling and grammar mistakes of the following text delimited by triple backticks.\n\nMake as few changes as possible. Only correct any spelling or grammar mistakes if the original text has spelling or grammar mistakes. Do not make any writing improvements.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nIf the original text has no spelling or grammar mistakes, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a shorter version of the following text delimited by triple backticks.\n\nYour task means making the text shorter, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same, if possible. Ensure the re-written text's word count is no more than half the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the shortened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a longer version of the following text delimited by triple backticks.\n\nYour task means making the text longer, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the lengthened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a simplified and easier-to-understand version of the following text delimited by triple backticks.\n\nYour task means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for you to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the simplified text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a re-worded version of the following text delimited by triple backticks.\n\nYour task means conveying the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original.\n\nWrite the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the paraphrased text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{POST_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a professional and formal tone.\n\nThe desired tone should be both professional and formal. To clarify:\n- 'Professional' means the language should exude confidence, precision, and clarity, while being devoid of any emotional or casual undertones.\n- 'Formal' means utilizing standard language, avoiding colloquialisms or slang, and maintaining a structured and cohesive flow.\n\nChoose the appropriate degree of professionalism and formality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a friendly and approachable tone.\n\nThe desired tone should be both friendly and approachable. To clarify:\n- 'Friendly' means the tone should convey warmth, like you're speaking to a friend. It should be inviting, kind, and free from formal or harsh language. It should make the reader feel welcome and understood.\n- 'Approachable' means the language should be simple and easy to understand. It shouldn't intimidate or alienate the reader, but rather make them feel welcome and encouraged to engage further.\n\nChoose the appropriate degree of friendliness and approachability in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a straightforward and direct tone.\n\nThe desired tone should be both straightforward and direct. To clarify:\n- 'Straightforward' means ensuring that the meaning of the text is easily understood. Use simple language, clear structures, and avoid jargon or complex sentences.\n- 'Direct' means using clear and simple language that goes straight to the point without any unnecessary embellishments.\n\nChoose the appropriate degree of straightforwardness and directness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a confident and firm tone.\n\nThe desired tone should be both confident and firm. To clarify:\n- 'Confident' means displaying certainty, full of assurance, and a clear understanding without any hesitation or doubt. Use clear and direct language.\n- 'Firm' means strongly and unwaveringly standing by the message, showcasing decisiveness without being aggressive.\n\nChoose the appropriate degree of confidence and firmness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a casual and informal tone.\n\nThe desired tone should be both casual and informal. To clarify:\n- 'Casual' means writing as if you're talking to a friend or someone of the same age in a light-hearted, relaxed, and easy-going tone. Feel free to use contractions, colloquialisms, and idioms.\n- 'Informal' means using everyday and conversational language. Avoid complex structures and technical terms or jargon unless it's widely understood. Shorten sentences where possible.\n\nChoose the appropriate degree of casualness and informality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a better version of the following text delimited by triple backticks.\n\nYour task means making the text clearer, easier to understand, and well put together, by correcting grammar, spelling, choosing the most suitable punctuation marks, selecting the best tone and style based on the topic and purpose of the text.\n\nChoose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the improved text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a highly proficient writer that can read and write properly and fluently. Your task is to proofread and correct the spelling and grammar mistakes of the following text delimited by triple backticks.\n\nMake as few changes as possible. Only correct any spelling or grammar mistakes if the original text has spelling or grammar mistakes. Do not make any writing improvements.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nIf the original text has no spelling or grammar mistakes, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a shorter version of the following text delimited by triple backticks.\n\nYour task means making the text shorter, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same, if possible. Ensure the re-written text's word count is no more than half the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the shortened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a longer version of the following text delimited by triple backticks.\n\nYour task means making the text longer, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the lengthened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a simplified and easier-to-understand version of the following text delimited by triple backticks.\n\nYour task means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for you to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the simplified text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a re-worded version of the following text delimited by triple backticks.\n\nYour task means conveying the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original.\n\nWrite the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the paraphrased text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{EMAIL_DRAFT}}\n```",
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

const chatPrompts: IContextMenuItem[] = [
  {
    id: '5962ed83-6526-4665-9d94-5c47bc0b931a',
    parent: 'root',
    droppable: true,
    text: 'Edit or review draft',
    data: {
      editable: false,
      visibility: {
        whitelist: ['discord.com', 'app.slack.com', 'web.whatsapp.com'],
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a better version of the following text delimited by triple backticks.\n\nYour task means making the text clearer, easier to understand, and well put together, by correcting grammar, spelling, choosing the most suitable punctuation marks, selecting the best tone and style based on the topic and purpose of the text.\n\nChoose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the improved text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a highly proficient writer that can read and write properly and fluently. Your task is to proofread and correct the spelling and grammar mistakes of the following text delimited by triple backticks.\n\nMake as few changes as possible. Only correct any spelling or grammar mistakes if the original text has spelling or grammar mistakes. Do not make any writing improvements.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nIf the original text has no spelling or grammar mistakes, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a shorter version of the following text delimited by triple backticks.\n\nYour task means making the text shorter, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same, if possible. Ensure the re-written text's word count is no more than half the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the shortened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a longer version of the following text delimited by triple backticks.\n\nYour task means making the text longer, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the lengthened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a professional and formal tone.\n\nThe desired tone should be both professional and formal. To clarify:\n- 'Professional' means the language should exude confidence, precision, and clarity, while being devoid of any emotional or casual undertones.\n- 'Formal' means utilizing standard language, avoiding colloquialisms or slang, and maintaining a structured and cohesive flow.\n\nChoose the appropriate degree of professionalism and formality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a friendly and approachable tone.\n\nThe desired tone should be both friendly and approachable. To clarify:\n- 'Friendly' means the tone should convey warmth, like you're speaking to a friend. It should be inviting, kind, and free from formal or harsh language. It should make the reader feel welcome and understood.\n- 'Approachable' means the language should be simple and easy to understand. It shouldn't intimidate or alienate the reader, but rather make them feel welcome and encouraged to engage further.\n\nChoose the appropriate degree of friendliness and approachability in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a straightforward and direct tone.\n\nThe desired tone should be both straightforward and direct. To clarify:\n- 'Straightforward' means ensuring that the meaning of the text is easily understood. Use simple language, clear structures, and avoid jargon or complex sentences.\n- 'Direct' means using clear and simple language that goes straight to the point without any unnecessary embellishments.\n\nChoose the appropriate degree of straightforwardness and directness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a confident and firm tone.\n\nThe desired tone should be both confident and firm. To clarify:\n- 'Confident' means displaying certainty, full of assurance, and a clear understanding without any hesitation or doubt. Use clear and direct language.\n- 'Firm' means strongly and unwaveringly standing by the message, showcasing decisiveness without being aggressive.\n\nChoose the appropriate degree of confidence and firmness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to rewrite the following text, delimited by triple backticks, in a casual and informal tone.\n\nThe desired tone should be both casual and informal. To clarify:\n- 'Casual' means writing as if you're talking to a friend or someone of the same age in a light-hearted, relaxed, and easy-going tone. Feel free to use contractions, colloquialisms, and idioms.\n- 'Informal' means using everyday and conversational language. Avoid complex structures and technical terms or jargon unless it's widely understood. Shorten sentences where possible.\n\nChoose the appropriate degree of casualness and informality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
          type: 'RENDER_TEMPLATE',
          parameters: {
            template:
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently, specialized in {{CURRENT_WEBSITE_DOMAIN}} posting, adept at composing all types of {{CURRENT_WEBSITE_DOMAIN}} posts in an appropriate manner. Your task is to write a simplified and easier-to-understand version of the following text delimited by triple backticks.\n\nYour task means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for you to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the simplified text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nText:\n```\n{{MESSAGE_DRAFT}}\n```",
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
      searchText: 'edit or review draft simplify language',
    },
  },
]

export default [
  ...emailPrompts,
  ...socialMediaPrompts,
  ...chatPrompts,
] as IContextMenuItem[]
