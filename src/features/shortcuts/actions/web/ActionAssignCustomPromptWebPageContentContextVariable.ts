import {
  ChatAppWebsites,
  type ChatAppWebsitesType,
  EmailWebsites,
  type EmailWebsitesType,
  SocialMediaWebsites,
  type SocialMediaWebsitesType,
} from '@/features/contextMenu/components/InputAssistantButton/config'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import Action from '@/features/shortcuts/core/Action'
import { ISetActionsType } from '@/features/shortcuts/types/Action'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

export class ActionAssignCustomPromptWebPageContentContextVariable extends Action {
  static type: ActionIdentifier =
    'ASSIGN_CUSTOM_PROMPT_WEB_PAGE_CONTENT_CONTEXT_VARIABLE'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }

  async execute(
    params: ActionParameters & ActionParameters['VariableMap'],
    engine: IShortcutEngineExternalEngine,
  ) {
    const host = getCurrentDomainHost()
    const {
      CUSTOM_PROMPT_HAS_DRAFT_CONTEXT = false,
      CUSTOM_PROMPT_HAS_FULL_CONTEXT = false,
      CUSTOM_PROMPT_HAS_TARGET_CONTEXT = false,
    } = params

    try {
      const actions: ISetActionsType = []

      // Email
      if (EmailWebsites.includes(host as EmailWebsitesType)) {
        if (CUSTOM_PROMPT_HAS_DRAFT_CONTEXT) {
          actions.push(
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
                VariableName: 'DRAFT_CONTEXT',
                VariableLabel: 'Draft context',
              },
            },
          )
        }

        if (
          CUSTOM_PROMPT_HAS_FULL_CONTEXT ||
          CUSTOM_PROMPT_HAS_TARGET_CONTEXT
        ) {
          const VariableMap: ActionParameters['VariableMap'] = {}
          if (CUSTOM_PROMPT_HAS_FULL_CONTEXT) {
            VariableMap.FULL_CONTEXT = {
              key: 'FULL_CONTEXT',
              value: '{{EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT}}',
              overwrite: true,
              isBuiltIn: true,
              label: 'Full context',
            }
          }
          if (CUSTOM_PROMPT_HAS_TARGET_CONTEXT) {
            VariableMap.TARGET_CONTEXT = {
              key: 'TARGET_CONTEXT',
              value: '{{EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT}}',
              overwrite: true,
              isBuiltIn: true,
              label: 'Target context',
            }
          }
          actions.push(
            {
              type: 'GET_EMAIL_CONTENTS_OF_WEBPAGE',
              parameters: {
                isVariableMiddleOutEnabled: true,
              },
            },
            {
              type: 'SET_VARIABLE_MAP',
              parameters: {
                VariableMap,
              },
            },
          )
        }
      }
      // Social media
      else if (SocialMediaWebsites.includes(host as SocialMediaWebsitesType)) {
        if (CUSTOM_PROMPT_HAS_DRAFT_CONTEXT) {
          actions.push(
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
                VariableName: 'DRAFT_CONTEXT',
                VariableLabel: 'Draft context',
              },
            },
          )
        }

        if (
          CUSTOM_PROMPT_HAS_FULL_CONTEXT ||
          CUSTOM_PROMPT_HAS_TARGET_CONTEXT
        ) {
          const VariableMap: ActionParameters['VariableMap'] = {}
          if (CUSTOM_PROMPT_HAS_FULL_CONTEXT) {
            VariableMap.FULL_CONTEXT = {
              key: 'FULL_CONTEXT',
              value: '{{SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT}}',
              overwrite: true,
              isBuiltIn: true,
              label: 'Full context',
            }
          }
          if (CUSTOM_PROMPT_HAS_TARGET_CONTEXT) {
            VariableMap.TARGET_CONTEXT = {
              key: 'TARGET_CONTEXT',
              value: '{{SOCIAL_MEDIA_TARGET_POST_OR_COMMENT}}',
              overwrite: true,
              isBuiltIn: true,
              label: 'Target context',
            }
          }
          actions.push(
            {
              type: 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE',
              parameters: {
                isVariableMiddleOutEnabled: true,
              },
            },
            {
              type: 'SET_VARIABLE_MAP',
              parameters: {
                VariableMap,
              },
            },
          )
        }
      }
      // Chat app website
      else if (ChatAppWebsites.includes(host as ChatAppWebsitesType)) {
        if (CUSTOM_PROMPT_HAS_DRAFT_CONTEXT) {
          actions.push(
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
                VariableName: 'DRAFT_CONTEXT',
                VariableLabel: 'Draft context',
              },
            },
          )
        }

        if (
          CUSTOM_PROMPT_HAS_FULL_CONTEXT ||
          CUSTOM_PROMPT_HAS_TARGET_CONTEXT
        ) {
          const VariableMap: ActionParameters['VariableMap'] = {}
          if (CUSTOM_PROMPT_HAS_FULL_CONTEXT) {
            VariableMap.FULL_CONTEXT = {
              key: 'FULL_CONTEXT',
              value:
                '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_CHAT_MESSAGES_CONTEXT}}',
              overwrite: true,
              isBuiltIn: true,
              label: 'Full context',
            }
          }
          if (CUSTOM_PROMPT_HAS_TARGET_CONTEXT) {
            VariableMap.TARGET_CONTEXT = {
              key: 'TARGET_CONTEXT',
              value:
                '{{MAXAI__CHAT_APP_WRITING_ASSISTANT_REPLY_TARGET_CONTENT}}',
              overwrite: true,
              isBuiltIn: true,
              label: 'Target context',
            }
          }
          actions.push(
            {
              type: 'GET_CHAT_MESSAGES_CONTENT_OF_WEBPAGE',
              parameters: {
                isVariableMiddleOutEnabled: true,
              },
            },
            {
              type: 'SET_VARIABLE_MAP',
              parameters: {
                VariableMap,
              },
            },
          )
        }
      }

      engine.shortcutsEngine?.pushActions(actions, 'after')
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
