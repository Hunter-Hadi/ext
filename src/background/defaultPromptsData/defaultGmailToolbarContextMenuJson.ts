import { isProduction } from '@/constants'
import { IContextMenuItem } from '@/features/contextMenu/types'
const editable = !isProduction

export default [
  {
    id: '8b80d639-40db-46aa-9647-90913e54a2b8',
    parent: 'root',
    droppable: false,
    text: '[Gmail] New email',
    data: {
      editable,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      icon: 'Email',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: 'Write an email:',
          },
        },
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
          },
        },
      ],
    },
  },
  {
    id: 'ee78534c-cbb0-459f-8432-1f691243ea1f',
    parent: 'root',
    droppable: false,
    text: '[Gmail] Reply',
    data: {
      editable,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      icon: 'Email',
      actions: [
        {
          type: 'RENDER_TEMPLATE',
          parameters: {
            template: `Ignore all previous instructions. You're a highly skilled email expert, adept at responding to all types of email messages in an appropriate manner. Your task is to write an email reply to the following text delimited by triple backticks, which is the last email you received from the recipient earlier on {{CURRENT_WEBSITE_DOMAIN}}.

Respond in {{AI_RESPONSE_LANGUAGE}}.

Text:
\`\`\`
{{GMAIL_EMAIL_CONTEXT}}
\`\`\`

Your task requires you to write a concise email reply in a polite, friendly, professional, and proper way.

Make the email reply clear, easy to understand, and well put together. Choose the most suitable punctuation marks, selecting the best tone and style based on the topic of the email message and the purpose of your email reply.

Choose simple words and phrases. Avoid ones that are too hard or confusing. Write the email reply like a real person would. Keep your tone balanced, not too casual or too formal, to match what the email reply is meant to do.

Do not include email subject, just output the email reply message.

Output the email reply without additional context, explanation, or extra wording, just the email reply itself. Don't use any punctuation, especially no quotes or backticks, around the text.

Now, write the email reply, mentioning these points:`,
          },
        },
        {
          type: 'INSERT_USER_INPUT',
          parameters: {
            template: '{{LAST_ACTION_OUTPUT}}',
          },
        },
      ],
    },
  },
  {
    id: 'a70f5c73-72c4-4fd7-a213-460f6593b225',
    parent: '5073e4ce-13f1-4c12-93fe-833ffec3ab8b',
    droppable: true,
    text: 'Professional',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a professional and formal tone.\n\nThe desired tone should be both professional and formal. To clarify:\n- 'Professional' means the language should exude confidence, precision, and clarity, while being devoid of any emotional or casual undertones.\n- 'Formal' means utilizing standard language, avoiding colloquialisms or slang, and maintaining a structured and cohesive flow.\n\nChoose the appropriate degree of professionalism and formality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: 'ffc003e5-816d-4c7b-a7ca-0ff2d1df1aa5',
    parent: '5073e4ce-13f1-4c12-93fe-833ffec3ab8b',
    droppable: true,
    text: 'Casual',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a casual and informal tone.\n\nThe desired tone should be both casual and informal. To clarify:\n- 'Casual' means writing as if you're talking to a friend or someone of the same age in a light-hearted, relaxed, and easy-going tone. Feel free to use contractions, colloquialisms, and idioms.\n- 'Informal' means using everyday and conversational language. Avoid complex structures and technical terms or jargon unless it's widely understood. Shorten sentences where possible.\n\nChoose the appropriate degree of casualness and informality in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: 'a211146b-a2d9-4c19-8187-e49a14cc54e6',
    parent: '5073e4ce-13f1-4c12-93fe-833ffec3ab8b',
    droppable: true,
    text: 'Straightforward',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a straightforward and direct tone.\n\nThe desired tone should be both straightforward and direct. To clarify:\n- 'Straightforward' means ensuring that the meaning of the text is easily understood. Use simple language, clear structures, and avoid jargon or complex sentences.\n- 'Direct' means using clear and simple language that goes straight to the point without any unnecessary embellishments.\n\nChoose the appropriate degree of straightforwardness and directness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: 'dd803af3-a0b5-4f69-be13-2210fe5eba6e',
    parent: '5073e4ce-13f1-4c12-93fe-833ffec3ab8b',
    droppable: true,
    text: 'Confident',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a confident and firm tone.\n\nThe desired tone should be both confident and firm. To clarify:\n- 'Confident' means displaying certainty, full of assurance, and a clear understanding without any hesitation or doubt. Use clear and direct language.\n- 'Firm' means strongly and unwaveringly standing by the message, showcasing decisiveness without being aggressive.\n\nChoose the appropriate degree of confidence and firmness in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: '5c15c9a2-199c-444e-ab13-f7429755b874',
    parent: '5073e4ce-13f1-4c12-93fe-833ffec3ab8b',
    droppable: true,
    text: 'Friendly',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to rewrite the following text, delimited by triple backticks, in a friendly and approachable tone.\n\nThe desired tone should be both friendly and approachable. To clarify:\n- 'Friendly' means the tone should convey warmth, like you're speaking to a friend. It should be inviting, kind, and free from formal or harsh language. It should make the reader feel welcome and understood.\n- 'Approachable' means the language should be simple and easy to understand. It shouldn't intimidate or alienate the reader, but rather make them feel welcome and encouraged to engage further.\n\nChoose the appropriate degree of friendliness and approachability in your tone to align with the subject and goal of the text.\n\nWrite the text like a real person would. Keep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the rewritten text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: 'cf8b9c91-7b74-4ef0-a5df-facf3623e7cc',
    parent: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    droppable: true,
    text: 'Improve writing',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a better version of the following text delimited by triple backticks.\n\nYour task means making the text clearer, easier to understand, and well put together, by correcting grammar, spelling, choosing the most suitable punctuation marks, selecting the best tone and style based on the topic and purpose of the text.\n\nChoose simple words and phrases to improve the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the improved text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: '6a3e9e6a-e26b-4723-a7c9-e8dedbed2227',
    parent: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    droppable: true,
    text: 'Fix spelling & grammar',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a highly proficient writer that can read and write properly and fluently. Your task is to proofread and correct the spelling and grammar mistakes of the following text delimited by triple backticks.\n\nMake as few changes as possible. Only correct any spelling or grammar mistakes if the original text has spelling or grammar mistakes. Do not make any writing improvements.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nIf the original text has no spelling or grammar mistakes, simply repeat the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the corrected text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: '211ddeb6-d48d-4840-b384-84b042e31368',
    parent: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    droppable: true,
    text: 'Make shorter',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a shorter version of the following text delimited by triple backticks.\n\nYour task means making the text shorter, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same, if possible. Ensure the re-written text's word count is no more than half the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the shortened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: 'd2effba2-f73a-4d71-affc-c5320037aabf',
    parent: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    droppable: true,
    text: 'Make longer',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a longer version of the following text delimited by triple backticks.\n\nYour task means making the text longer, and keeping the text clear, easy to understand, and well put together.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same if possible. Ensure the rewritten text's word count is more than twice the original text but no more than 4 times the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the lengthened text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: '5073e4ce-13f1-4c12-93fe-833ffec3ab8b',
    parent: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    droppable: true,
    text: 'Change tone',
    data: {
      editable,
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
    id: '2b77210f-4322-450d-a345-275493203750',
    parent: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    droppable: true,
    text: 'Simplify language',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a simplified and easier-to-understand version of the following text delimited by triple backticks.\n\nYour task means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for you to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand.\n\nChoose simple words and phrases to write the text. Avoid ones that are too hard or confusing. Write the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do. If a word, phrase, or part of the text is already clear and effective, leave it as it is, unchanged.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the simplified text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: '9a135767-4e4e-45b3-a8dd-7f9150dcb2a9',
    parent: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    droppable: true,
    text: 'Paraphrase',
    data: {
      editable,
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
              "Ignore all previous instructions. You are a real human that can read and write properly and fluently. Your task is to write a re-worded version of the following text delimited by triple backticks.\n\nYour task means conveying the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original.\n\nWrite the text like a real person would. Keep your tone balanced, not too casual or too formal, to match what the text is meant to do.\n\nKeep the meaning the same. If possible, retain the structure of the paragraphs. Ensure the re-written text's word count is near to the original text.\n\nOutput the answer without additional context, explanation, or extra wording, just the paraphrased text itself. Don't use any punctuation, especially no quotes or backticks, around the text.\n\nRespond in {{AI_RESPONSE_LANGUAGE}}.\n\nText:\n```\n{{GMAIL_DRAFT_CONTEXT}}\n```",
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
    id: 'aafdf878-b383-47f0-bc7f-29695a15cb59',
    parent: 'root',
    droppable: false,
    text: 'Edit or review draft',
    data: {
      editable,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'group',
      actions: [],
    },
  },
] as IContextMenuItem[]
