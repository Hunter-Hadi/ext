import {
  USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
} from '@/types'
import { IContextMenuItem } from '@/features/contextMenu/types'

export default [
  {
    id: USECHATGPT_GMAIL_NEW_EMAIL_CTA_BUTTON_ID,
    parent: 'root',
    droppable: false,
    text: 'Gmail (New email)',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      icon: 'Email',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
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
    id: USECHATGPT_GMAIL_REPLY_CTA_BUTTON_ID,
    parent: 'root',
    droppable: false,
    text: 'Gmail (Reply)',
    data: {
      editable: false,
      visibility: {
        isWhitelistMode: false,
        whitelist: [],
        blacklist: [],
      },
      type: 'shortcuts',
      icon: 'Email',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              '"""\n{{GMAIL_EMAIL_CONTEXT}}\n"""\nWrite a reply to the email above: ',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Definition of "professional tone": "A professional tone is a way of writing that conveys a sense of formality, respect, and competence. A person writing with a professional tone uses language and intonation that is more formal and appropriate for a business or formal setting. A professional tone can be identified by a number of verbal and nonverbal cues, including:\n- Use of formal language and vocabulary \n- Avoidance of slang and colloquial expressions \n- Appropriate use of titles and honorifics \n- Direct and concise statements \n- Maintaining a neutral tone \n- Use of polite language and manners \nOverall, a professional tone communicates a sense of competence and credibility, which can help establish trust and influence in business or formal settings. It is important to note that a professional tone should be tailored to the specific situation and audience, as different contexts may require different levels of formality or informality."\nI will give you text content, you will rewrite it and output that in a "professional tone". \nKeep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      searchText: 'change tone professional',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Definition of "casual tone": "A casual tone is a way of writing that conveys informality, relaxation, and a sense of ease. A person writing with a casual tone uses language and intonation that is less formal and more relaxed, conveying a sense of familiarity and comfort. A casual tone can be identified by a number of verbal and nonverbal cues, including:\n- Use of informal language and slang\n- Use of contractions \n- Use of humor and anecdotes \n- Intonation and tone that is less formal \nOverall, a casual tone communicates a sense of informality and friendliness, which can help establish a more relaxed and comfortable atmosphere in both personal and professional contexts. It is important to note that while a casual tone can be appropriate in some situations, it may not be suitable for all situations and should be used with discretion."\nI will give you text content, you will rewrite it and output that in a "casual tone". \nKeep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      searchText: 'change tone casual',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Definition of "straightforward tone": "Being straightforward means writing in a clear and honest manner without any ambiguity, deception, or hidden meanings. It is a way of expressing oneself directly and without any beating around the bush. A straightforward approach to writing involves being clear and concise in what you write, and avoiding the use of unnecessarily complicated or technical language that may be difficult for others to understand. It also involves being honest and transparent in your interactions, and not withholding information or misrepresenting the truth. A straightforward approach can be identified by a number of verbal and nonverbal cues, including:\n- Clear and direct language \n- Avoiding euphemisms or indirect statements \n- Writing plainly and using simple vocabulary\n- Being honest and transparent \nOverall, being straightforward can help build trust and credibility with others, as it demonstrates a commitment to honesty and integrity in all communications."\nI will give you text content, you will rewrite it and output that in a "straightforward tone".\nKeep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Definition of "confident tone": "A confident tone is a way of writing that conveys self-assurance, certainty, and conviction in one\'s words and ideas. A person writing with a confident tone writes clearly, firmly, and without hesitation, projecting authority and credibility in their message.  A confident tone can be identified by a number of verbal and nonverbal cues, including:\n- Assertive and positive word choices\n- Direct and concise statements\nOverall, a confident tone communicates a sense of self-assuredness and credibility, which can help establish trust and influence in both personal and professional contexts."\nI will give you text content, you will rewrite it and output that in a "confident tone".\nKeep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      searchText: 'change tone confident',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Definition of "friendly tone": "A friendly tone is a way of writing that conveys warmth, kindness, and approachability. A person writing with a friendly tone uses language and intonation that makes the listener feel welcome, comfortable, and at ease. A friendly tone can be identified by a number of verbal and nonverbal cues, including:\n- Pleasant and upbeat vocabulary\n- Positive and encouraging statements \nOverall, a friendly tone communicates a sense of openness, friendliness, and a willingness to connect, which can help build positive relationships and rapport in both personal and professional contexts."\nI will give you text content, you will rewrite it and output that in a "friendly tone".\nKeep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      searchText: 'change tone friendly',
    },
  },
  {
    id: '4e54395c-5e8b-4bbd-a309-b6057a4737d3',
    parent: '265bf819-f40b-482e-bbd8-df0480126c8a',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'I will give you text content, you will rewrite it and output a better version of my text.\nKeep the meaning the same. Make sure the re-written content\'s number of characters is the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'AutoFix',
      searchText: 'edit or review selection improve writing',
    },
  },
  {
    id: '496d1369-941d-49a5-a9ce-68eadd7601de',
    parent: '265bf819-f40b-482e-bbd8-df0480126c8a',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'I will give you text content, you will correct the spelling, syntax and grammar of this text. Correct any spelling, syntax, or grammar mistakes in the text I give you without making any improvements or changes to the original meaning or style. In other words, only correct spelling, syntax, or grammar mistakes, do not make improvements. If the original text has no mistake, just output the original text and nothing else.\nKeep the meaning the same. Make sure the re-written content\'s number of words is the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Done',
      searchText: 'edit or review selection fix spelling & grammar',
    },
  },
  {
    id: '547b5b2d-4f7b-4b39-8fdc-524a31659238',
    parent: '265bf819-f40b-482e-bbd8-df0480126c8a',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'I\'ll give you text. You\'ll rewrite it and output it shorter to be no more than half the number of characters of the original text.\nKeep the meaning the same. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'ShortText',
      searchText: 'edit or review selection make shorter',
    },
  },
  {
    id: '1f0b58d6-10cb-4e60-bbc9-10912ca6301c',
    parent: '265bf819-f40b-482e-bbd8-df0480126c8a',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'I\'ll give you text. You\'ll rewrite it and output it longer to be more than twice the number of characters of the original text.\nKeep the meaning the same. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'LongText',
      searchText: 'edit or review selection make longer',
    },
  },
  {
    id: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    parent: '265bf819-f40b-482e-bbd8-df0480126c8a',
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
    parent: '265bf819-f40b-482e-bbd8-df0480126c8a',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Definition of "simplify language": "Simplifying language means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for writers to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand."\nI will give you text content, you will rewrite it to "simply language" of it and output that in an easy-to-understand version of my text. \nKeep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'AutoAwesome',
      searchText: 'edit or review selection simplify language',
    },
  },
  {
    id: '84060107-e962-412b-afa2-f8134e593320',
    parent: '265bf819-f40b-482e-bbd8-df0480126c8a',
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
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'I will give you text content, you will rewrite it and output that in a re-worded version of my text. Reword the text to convey the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original. Keep the tone the same. \nKeep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only give me the output and nothing else.\nNow, using the concepts above, re-write the following text. Respond in {{AI_OUTPUT_LANGUAGE}}:\n"""\n{{GMAIL_DRAFT_CONTEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Autorenew',
      searchText: 'edit or review selection paraphrase',
    },
  },
  {
    id: `265bf819-f40b-482e-bbd8-df0480126c8a`,
    parent: 'root',
    droppable: false,
    text: 'Edit or review draft',
    data: {
      editable: false,
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