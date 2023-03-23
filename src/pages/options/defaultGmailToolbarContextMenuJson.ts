import { IContextMenuItem } from '@/features/contextMenu'
import {
  EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
  EZMAIL_REPLY_CTA_BUTTON_ID,
  EZMAIL_REPLY_GROUP_ID,
  EZMAIL_NEW_MAIL_GROUP_ID,
} from '@/types'

export default [
  {
    id: '86b921d3-9cf1-4c54-945b-75868d5b1bba',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Fix spelling & grammar',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will correct the spelling, syntax and grammar of this text. Correct any spelling, syntax, or grammar mistakes in the text I give you without making any improvements or changes to the original meaning or style. In other words, only correct spelling, syntax, or grammar mistakes mistakes, do not make improvements. Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the correction, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Done',
    },
  },
  {
    id: '0f499960-80ef-47e5-96f8-818673402e80',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Make shorter',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in a much shorter version of my text. Keep the meaning the same. Only reply to the re-written text, nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'ShortText',
    },
  },

  {
    id: '61a92a82-8c3c-4e72-bf8b-77f2bb8bd5d1',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Make longer',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in a much longer version of my text. Keep the meaning the same. Only reply to the re-written text, nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'LongText',
    },
  },

  {
    id: '20d3e1d1-7c20-4c6c-9d45-f0e01db6a8cc',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Change tone',
    data: {
      editable: true,
      type: 'group',
      actions: [],
      icon: 'Voice',
    },
  },
  {
    id: 'a6534df3-d7cc-4285-90f8-191dab4a8024',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Simplify language',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "simplify language": "Simplifying language means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for writers to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand."\n\nI will give you text content, you will rewrite it to "simply language" of it and output that in an easy-to-understand version of my text. Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'AutoAwesome',
    },
  },

  {
    id: 'a82e1e6b-60da-410b-831e-5e32c8161bac',
    parent: EZMAIL_NEW_MAIL_GROUP_ID,
    droppable: true,
    text: 'Paraphrase',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in a re-worded version of my text. Reword the text to convey the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original. Keep the tone the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Only reply to the rephrased text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Autorenew',
    },
  },

  // children
  {
    id: '0e092009-5327-4530-a9d8-9e24731eb3ba',
    parent: '20d3e1d1-7c20-4c6c-9d45-f0e01db6a8cc',
    droppable: true,
    text: 'Professional',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "professional tone": "A professional tone is a way of speaking that conveys a sense of formality, respect, and competence. A person speaking with a professional tone uses language and intonation that is more formal and appropriate for a business or formal setting. A professional tone can be identified by a number of verbal and nonverbal cues, including:\n- Use of formal language and vocabulary \n- Avoidance of slang and colloquial expressions \n- Appropriate use of titles and honorifics \n- Direct and concise statements \n- Maintaining a neutral tone \n- Use of polite language and manners \nOverall, a professional tone communicates a sense of competence and credibility, which can help establish trust and influence in business or formal settings. It is important to note that a professional tone should be tailored to the specific situation and audience, as different contexts may require different levels of formality or informality."\n\nI will give you text content, you will rewrite it and output that in a "professional tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: '43b4d40f-66a2-4892-a40a-09b8f0b9e678',
    parent: '20d3e1d1-7c20-4c6c-9d45-f0e01db6a8cc',
    droppable: true,
    text: 'Casual',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "casual tone": "A casual tone is a way of speaking that conveys informality, relaxation, and a sense of ease. A person speaking with a casual tone uses language and intonation that is less formal and more relaxed, conveying a sense of familiarity and comfort. A casual tone can be identified by a number of verbal and nonverbal cues, including:\n- Use of informal language and slang\n- Use of contractions \n- Use of humor and anecdotes \n- More relaxed body language \n- Intonation and tone that is less formal \nOverall, a casual tone communicates a sense of informality and friendliness, which can help establish a more relaxed and comfortable atmosphere in both personal and professional contexts. It is important to note that while a casual tone can be appropriate in some situations, it may not be suitable for all situations and should be used with discretion."\n\nI will give you text content, you will rewrite it and output that in a "casual tone". Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: '9071fd38-83c7-48eb-bfb9-849e26275bb2',
    parent: '20d3e1d1-7c20-4c6c-9d45-f0e01db6a8cc',
    droppable: true,
    text: 'Straightforward',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "straightforward tone": "Being straightforward means communicating in a clear and honest manner without any ambiguity, deception, or hidden meanings. It is a way of expressing oneself directly and without any beating around the bush. A straightforward approach to communication involves being clear and concise in what you say, and avoiding the use of unnecessarily complicated or technical language that may be difficult for others to understand. It also involves being honest and transparent in your interactions, and not withholding information or misrepresenting the truth. A straightforward approach can be identified by a number of verbal and nonverbal cues, including:\n- Clear and direct language \n- Avoiding euphemisms or indirect statements \n- Speaking plainly and using simple vocabulary\n- Making eye contact and maintaining an engaged posture \n- Being honest and transparent \nOverall, being straightforward can help build trust and credibility with others, as it demonstrates a commitment to honesty and integrity in all communications."\n\nI will give you text content, you will rewrite it and output that in a "straightforward tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: '806223fa-da5c-4c59-9c7f-3dfb526fdd43',
    parent: '20d3e1d1-7c20-4c6c-9d45-f0e01db6a8cc',
    droppable: true,
    text: 'Confident',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "confident tone": "A confident tone is a way of speaking that conveys self-assurance, certainty, and conviction in one\'s words and ideas. A person speaking with a confident tone speaks clearly, firmly, and without hesitation, projecting authority and credibility in their message.  A confident tone can be identified by a number of verbal and nonverbal cues, including:\n- Steady pace and rhythm of speech\n- Clear enunciation and pronunciation\n- Strong and consistent voice volume\n- Assertive and positive word choices\n- Direct and concise statements\n- Maintaining eye contact and a relaxed body posture\nOverall, a confident tone communicates a sense of self-assuredness and credibility, which can help establish trust and influence in both personal and professional contexts."\n\nI will give you text content, you will rewrite it and output that in a "confident tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: 'fa928651-d96b-4e0b-9a2e-411956c7eba1',
    parent: '20d3e1d1-7c20-4c6c-9d45-f0e01db6a8cc',
    droppable: true,
    text: 'Friendly',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "friendly tone": "A friendly tone is a way of speaking that conveys warmth, kindness, and approachability. A person speaking with a friendly tone uses language and intonation that makes the listener feel welcome, comfortable, and at ease. A friendly tone can be identified by a number of verbal and nonverbal cues, including:\n- Soft and relaxed intonation \n- Pleasant and upbeat vocabulary\n- Warm and welcoming body language \n- Smiling, when appropriate \n- Positive and encouraging statements \nOverall, a friendly tone communicates a sense of openness, friendliness, and a willingness to connect, which can help build positive relationships and rapport in both personal and professional contexts."\n\nI will give you text content, you will rewrite it and output that in a "friendly tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: '496d1369-941d-49a5-a9ce-68eadd7601de',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Fix spelling & grammar',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will correct the spelling, syntax and grammar of this text. Correct any spelling, syntax, or grammar mistakes in the text I give you without making any improvements or changes to the original meaning or style. In other words, only correct spelling, syntax, or grammar mistakes mistakes, do not make improvements. Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the correction, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Done',
    },
  },
  {
    id: '547b5b2d-4f7b-4b39-8fdc-524a31659238',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Make shorter',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in a much shorter version of my text. Keep the meaning the same. Only reply to the re-written text, nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'ShortText',
    },
  },

  {
    id: '1f0b58d6-10cb-4e60-bbc9-10912ca6301c',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Make longer',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in a much longer version of my text. Keep the meaning the same. Only reply to the re-written text, nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'LongText',
    },
  },

  {
    id: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Change tone',
    data: {
      editable: true,
      type: 'group',
      actions: [],
      icon: 'Voice',
    },
  },
  {
    id: '3ca990dc-b70b-49b5-abfa-eb1dc8e5f271',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Simplify language',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "simplify language": "Simplifying language means using clear and concise language that is easy for the intended audience to understand. This involves avoiding overly complex sentence structures, technical jargon, or obscure vocabulary, and using familiar words and straightforward expressions. The goal is to make the text more accessible to a wider audience, ensuring that the message is communicated effectively without causing confusion or misunderstanding. Simplifying language can be particularly important when writing for a general audience or when trying to convey complex information or ideas in a more approachable way. It is essential for writers to strike a balance between simplifying language and maintaining the tone and voice of the text, so that it remains engaging and informative while being easy to read and understand."\n\nI will give you text content, you will rewrite it to "simply language" of it and output that in an easy-to-understand version of my text. Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'AutoAwesome',
    },
  },

  {
    id: '84060107-e962-412b-afa2-f8134e593320',
    parent: EZMAIL_REPLY_GROUP_ID,
    droppable: true,
    text: 'Paraphrase',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in a re-worded version of my text. Reword the text to convey the same meaning using different words and sentence structures. Avoiding plagiarism, improving the flow and readability of the text, and ensuring that the re-written content is unique and original. Keep the tone the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Only reply to the rephrased text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Autorenew',
    },
  },

  // children
  {
    id: '202a7ddd-bea5-46b3-b32c-a0300c7ac1ee',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Professional',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "professional tone": "A professional tone is a way of speaking that conveys a sense of formality, respect, and competence. A person speaking with a professional tone uses language and intonation that is more formal and appropriate for a business or formal setting. A professional tone can be identified by a number of verbal and nonverbal cues, including:\n- Use of formal language and vocabulary \n- Avoidance of slang and colloquial expressions \n- Appropriate use of titles and honorifics \n- Direct and concise statements \n- Maintaining a neutral tone \n- Use of polite language and manners \nOverall, a professional tone communicates a sense of competence and credibility, which can help establish trust and influence in business or formal settings. It is important to note that a professional tone should be tailored to the specific situation and audience, as different contexts may require different levels of formality or informality."\n\nI will give you text content, you will rewrite it and output that in a "professional tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: 'df5768a8-448d-4070-afa1-5307838ed965',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Casual',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "casual tone": "A casual tone is a way of speaking that conveys informality, relaxation, and a sense of ease. A person speaking with a casual tone uses language and intonation that is less formal and more relaxed, conveying a sense of familiarity and comfort. A casual tone can be identified by a number of verbal and nonverbal cues, including:\n- Use of informal language and slang\n- Use of contractions \n- Use of humor and anecdotes \n- More relaxed body language \n- Intonation and tone that is less formal \nOverall, a casual tone communicates a sense of informality and friendliness, which can help establish a more relaxed and comfortable atmosphere in both personal and professional contexts. It is important to note that while a casual tone can be appropriate in some situations, it may not be suitable for all situations and should be used with discretion."\n\nI will give you text content, you will rewrite it and output that in a "casual tone". Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: 'ce02e42f-e341-4b94-8bbc-095122507bd2',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Straightforward',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "straightforward tone": "Being straightforward means communicating in a clear and honest manner without any ambiguity, deception, or hidden meanings. It is a way of expressing oneself directly and without any beating around the bush. A straightforward approach to communication involves being clear and concise in what you say, and avoiding the use of unnecessarily complicated or technical language that may be difficult for others to understand. It also involves being honest and transparent in your interactions, and not withholding information or misrepresenting the truth. A straightforward approach can be identified by a number of verbal and nonverbal cues, including:\n- Clear and direct language \n- Avoiding euphemisms or indirect statements \n- Speaking plainly and using simple vocabulary\n- Making eye contact and maintaining an engaged posture \n- Being honest and transparent \nOverall, being straightforward can help build trust and credibility with others, as it demonstrates a commitment to honesty and integrity in all communications."\n\nI will give you text content, you will rewrite it and output that in a "straightforward tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: '3c3edab4-4125-43ac-89c0-ca95cda06d34',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Confident',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "confident tone": "A confident tone is a way of speaking that conveys self-assurance, certainty, and conviction in one\'s words and ideas. A person speaking with a confident tone speaks clearly, firmly, and without hesitation, projecting authority and credibility in their message.  A confident tone can be identified by a number of verbal and nonverbal cues, including:\n- Steady pace and rhythm of speech\n- Clear enunciation and pronunciation\n- Strong and consistent voice volume\n- Assertive and positive word choices\n- Direct and concise statements\n- Maintaining eye contact and a relaxed body posture\nOverall, a confident tone communicates a sense of self-assuredness and credibility, which can help establish trust and influence in both personal and professional contexts."\n\nI will give you text content, you will rewrite it and output that in a "confident tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: '61404250-a6af-41e2-8b9a-4d6fcfefdb95',
    parent: '718dae5a-8c58-47a7-9089-5dc02cedbc3c',
    droppable: true,
    text: 'Friendly',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nDefinition of "friendly tone": "A friendly tone is a way of speaking that conveys warmth, kindness, and approachability. A person speaking with a friendly tone uses language and intonation that makes the listener feel welcome, comfortable, and at ease. A friendly tone can be identified by a number of verbal and nonverbal cues, including:\n- Soft and relaxed intonation \n- Pleasant and upbeat vocabulary\n- Warm and welcoming body language \n- Smiling, when appropriate \n- Positive and encouraging statements \nOverall, a friendly tone communicates a sense of openness, friendliness, and a willingness to connect, which can help build positive relationships and rapport in both personal and professional contexts."\n\nI will give you text content, you will rewrite it and output that in a "friendly tone". Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
    },
  },
  {
    id: EZMAIL_REPLY_GROUP_ID,
    parent: 'root',
    droppable: true,
    text: 'Adjust draft',
    data: {
      editable: true,
      type: 'group',
      actions: [],
    },
  },
  {
    id: EZMAIL_NEW_MAIL_GROUP_ID,
    parent: 'root',
    droppable: false,
    text: 'Adjust new email',
    data: {
      editable: true,
      type: 'group',
      actions: [],
    },
  },
  {
    id: EZMAIL_NEW_EMAIL_CTA_BUTTON_ID,
    parent: 'root',
    droppable: false,
    text: 'EzMail',
    data: {
      editable: true,
      type: 'shortcuts',
      icon: 'EzMail',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              '"""\n{{GMAIL_MESSAGE_CONTEXT}}\n"""\nWrite a reply to the email above: ',
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
    id: EZMAIL_REPLY_CTA_BUTTON_ID,
    parent: 'root',
    droppable: false,
    text: 'EzMail',
    data: {
      editable: true,
      type: 'shortcuts',
      icon: 'EzMail',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              '"""\n{{GMAIL_MESSAGE_CONTEXT}}\n"""\nWrite a reply to the email above: ',
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
] as IContextMenuItem[]
