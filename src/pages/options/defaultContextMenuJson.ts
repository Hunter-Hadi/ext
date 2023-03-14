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
              'Translate the following text into English, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Korean, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Chinese, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Japanese, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Spanish, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Russian, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into French, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Portuguese, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into German, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Italian, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Dutch, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Indonesian, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Filipino, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Translate the following text into Vietnamese, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Summarize the following text, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Explain the following text in easy-to-understand words, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Find action items from the following text and display the results in bullet points, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Paraphrase the following text in a professional tone, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Paraphrase the following text in a casual tone, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Paraphrase the following text in a straightforward tone, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Paraphrase the following text in a confident tone, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Paraphrase the following text in a friendly tone, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Improve the writing in the following text, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Fix spelling and grammar in the following text, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Make the following text shorter, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Make the following text longer, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
              'Simplify the language in the following text, do not write explanations:\n"""\n{{HIGHLIGHTED_TEXT}}\n"""',
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
