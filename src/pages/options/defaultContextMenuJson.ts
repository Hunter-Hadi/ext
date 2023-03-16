import { IContextMenuItem } from '@/features/contextMenu'

export default [
  {
    id: 'b517f321-5533-41e5-8ed0-64eb6aa4b7bd',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'English',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into English language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '6de2edc2-019f-4a6c-9051-a15aa11338a0',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Korean',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Korean language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: 'e5a30298-52e9-431d-89d8-6f5431c236c9',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Chinese',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Chinese language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '2a753c24-a5cb-496a-a34b-1037e366e690',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Japanese',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Japanese language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '1aabb1d3-f1af-4e81-aab9-fe4d16630cc3',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Spanish',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Spanish language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '3aca0447-12a5-4453-b4b2-64e45f16598a',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Russian',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Russian language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: 'ad6cebdb-c5ab-4db5-8776-95d6381b90de',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'French',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into French language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '481f6d4a-9045-4cd0-b5e7-1eec6822bed3',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Portuguese',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Portuguese language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '8b6f4e3f-7669-44a8-a020-fb88c5c9d592',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'German',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into German language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: 'd1484846-cba5-4b2b-9fef-0a2d0f4b15b7',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Italian',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Italian language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '96248543-4145-4b5c-b4eb-e6398695a24e',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Dutch',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Dutch language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: 'd4051326-c55b-4611-944a-3457ff0a8ed7',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Indonesian',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Indonesian language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '0d6cce80-546b-4b09-8fe5-f84f195d9d2e',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Filipino',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Filipino language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '24766e7e-a419-4992-aaaf-786a37a0e111',
    parent: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    droppable: true,
    text: 'Vietnamese',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and translate the text into Vietnamese language. Keep the meaning the same. Do not alter the original structure and formatting outlined in any way. Only reply to the re-written text, and do not write anything else. Do not write explanations. Do not echo my prompt. Do not echo the text I give you. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, translate the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    id: '7b26a25c-e869-4832-b5bb-b19685f5c3a5',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Summarize',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in a short summarized version of my text. Keep the meaning the same. Ensure that the revised content has significantly fewer characters than the original text, and no more than 100 words, the fewer the better. Only reply to the summary, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, summarize the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Summarize',
    },
  },
  {
    id: '79ce6a91-7bda-4175-b2f9-7f2403fd8dcc',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'List key takeaways',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will analyze it and output the key takeaways in bullet point format. Keep the meaning the same. Ensure that the revised content has significantly fewer characters than the original text, and no more than 100 words, the fewer the better. Only reply to the summary, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, give me the key takeaways from the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Bulleted',
    },
  },
  {
    id: '4d226b15-9e21-42ba-8af8-57d6fbae5a3d',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Translate',
    data: {
      editable: true,
      type: 'group',
      actions: [],
      icon: 'Language',
    },
  },
  {
    id: '1444ae1f-dbb1-4136-8898-98431ee3a1bb',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Explain this',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will explain it and output an easy-to-understand explanation. I want you to pretend to explain the text to a middle school student who has no background knowledge or professional knowledge about the text I give you. Your task is to write the highest quality explanation possible, including examples and analogies if necessary. Only reply to the explanation, and do not write anything else. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Just give me your best possible result.\n\nNow, using the concepts above, explain the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'Question',
    },
  },
  {
    id: 'bd4f9e5a-f9d4-4d1c-aab8-43f951739ab0',
    parent: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    droppable: true,
    text: 'Find action items',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will find action items from it and output them in bullet point format. Identify only the action items that need the reader to take action, and exclude action items requiring action from anyone other than the reader. Only reply to the bullet points of action items you find, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, find action items from the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'ListAlt',
    },
  },
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
    id: '4e54395c-5e8b-4bbd-a309-b6057a4737d3',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    droppable: true,
    text: 'Improve writing',
    data: {
      editable: true,
      type: 'shortcuts',
      actions: [
        {
          type: 'RENDER_CHATGPT_PROMPT',
          parameters: {
            template:
              'Ignore all previous instructions.\n\nI will give you text content, you will rewrite it and output that in the corrected and improved version of my text. Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the correction, and the improvements and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
          },
        },
        {
          type: 'ASK_CHATGPT',
          parameters: {},
        },
      ],
      icon: 'AutoFix',
    },
  },
  {
    id: '496d1369-941d-49a5-a9ce-68eadd7601de',
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
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
              'Ignore all previous instructions.\n\nI will give you text content, you will correct the spelling, syntax and grammar of this text. If any portion of the text is free of spelling, syntax, or grammar errors, retain it as it is and only correct those parts that contain such errors. Keep the meaning the same. Make sure the re-written content\'s number of characters is exactly the same as the original text\'s number of characters. Do not alter the original structure and formatting outlined in any way. Only reply to the correction, and nothing else. Do not write explanations. Do not echo my prompt. Do not remind me what I asked you for. Do not apologize. Do not self-reference. Do not use generic filler phrases. Get to the point precisely and accurately. Do not explain what and why, just give me your best possible result.\n\nNow, using the concepts above, re-write the following text. Respond in the same language variety or dialect of the following text:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
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
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
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
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
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
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
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
    parent: '30f27496-1faf-4a00-87cf-b53926d35bfd',
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
  {
    id: '30f27496-1faf-4a00-87cf-b53926d35bfd',
    parent: 'root',
    droppable: true,
    text: 'Edit or review selection',
    data: {
      editable: true,
      type: 'group',
      actions: [],
    },
  },
  {
    id: '80e6d17b-2cf5-456b-944b-5f645f0e12de',
    parent: 'root',
    droppable: true,
    text: 'Generate from selection',
    data: {
      editable: true,
      type: 'group',
      actions: [],
    },
  },
] as IContextMenuItem[]
