import { APP_USE_CHAT_GPT_API_HOST, APP_VERSION } from '@/constants'
import { getMaxAIChromeExtensionAccessToken } from '@/features/auth/utils'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts'
import { ActionGetSocialMediaPostContentOfWebPage } from '@/features/shortcuts/actions/web'
import Action from '@/features/shortcuts/core/Action'
import { pushOutputToChat } from '@/features/shortcuts/decorators'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'
import { clientFetchAPI } from '@/features/shortcuts/utils'
import { aesJsonEncrypt } from '@/utils/encryptionHelper'

interface ISummaryRecordData {
  ai_model: string
  ai_r_language: string
  url: string
  url_type: string
  version: string
  summary: string
  title: string
  meta: Record<string, any>
}

export class ActionsMaxAISummaryLog extends Action {
  static type: ActionIdentifier = 'MAXAI_SUMMARY_LOG'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  @pushOutputToChat({
    onlyError: true,
  })
  async execute(
    params: ActionParameters,
    engine: IShortcutEngineExternalEngine,
  ) {
    try {
      const shortcutsEngine = engine.shortcutsEngine
      const clientConversationEngine = engine.clientConversationEngine

      const summaryOutput =
        shortcutsEngine?.getVariable('SUMMARY_CONTENTS')?.value || ''
      const title =
        shortcutsEngine?.getVariable('CURRENT_WEBPAGE_TITLE')?.value || ''
      const url =
        shortcutsEngine?.getVariable('CURRENT_WEBPAGE_URL')?.value || ''
      const aiResponseLanguage =
        shortcutsEngine?.getVariable('AI_RESPONSE_LANGUAGE')?.value || ''

      const conversation = await clientConversationEngine?.getCurrentConversation()

      if (conversation && summaryOutput) {
        const summaryType = conversation?.meta.pageSummaryType
        const recordData: ISummaryRecordData = {
          ai_model: 'auto', //由于 summary 现在都是通过后端动态调节 mode ，所以这里先传 auto
          // ai_model: conversation?.meta.AIModel ?? '',
          ai_r_language: aiResponseLanguage,
          url: url,
          url_type: summaryType,
          version: APP_VERSION,
          summary: summaryOutput,
          title,
          meta: {},
        }

        // youtube summary
        // 先只记录 youtube 的 summary
        if (summaryType === 'YOUTUBE_VIDEO_SUMMARY') {
          const socialMediaAction = shortcutsEngine?.actions.find((action) => {
            return action.type === 'GET_SOCIAL_MEDIA_POST_CONTENT_OF_WEBPAGE'
          }) as ActionGetSocialMediaPostContentOfWebPage
          if (
            socialMediaAction &&
            socialMediaAction.originalSocialMediaPostContent
          ) {
            recordData.meta = socialMediaAction.originalSocialMediaPostContent
          }
        }

        // // email summary
        // if (summaryType === 'DEFAULT_EMAIL_SUMMARY') {
        //   recordData.meta.emailContextsOfWebpageFullEmailContext =
        //     shortcutsEngine?.getVariable(
        //       'EMAIL_CONTEXTS_OF_WEBPAGE_FULL_EMAIL_CONTEXT',
        //     )?.value || ''
        //   recordData.meta.emailContextsOfWebpageTargetEmailContext =
        //     shortcutsEngine?.getVariable(
        //       'EMAIL_CONTEXTS_OF_WEBPAGE_TARGET_EMAIL_CONTEXT',
        //     )?.value || ''
        // }

        // // page summary
        // if (summaryType === 'PAGE_SUMMARY') {
        //   recordData.meta.readabilityContents =
        //     shortcutsEngine?.getVariable('READABILITY_CONTENTS')?.value || ''

        //   const getReadabilityContentsOfWebPageAction = shortcutsEngine?.actions.find(
        //     (action) => {
        //       return action.type === 'GET_READABILITY_CONTENTS_OF_WEBPAGE'
        //     },
        //   ) as ActionGetReadabilityContentsOfWebPage
        //   if (getReadabilityContentsOfWebPageAction) {
        //     recordData.meta.originalInnerText =
        //       getReadabilityContentsOfWebPageAction.originalInnerText
        //   }
        // }

        // if (summaryType === 'PDF_CRX_SUMMARY') {
        //   const analyzeChatFileAction = shortcutsEngine?.actions.find(
        //     (action) => {
        //       return action.type === 'ANALYZE_CHAT_FILE'
        //     },
        //   )
        //   if (analyzeChatFileAction) {
        //     recordData.meta.analyzeChatFile = analyzeChatFileAction.output
        //   }

        //   const searchParams = new URLSearchParams(location.search)
        //   const file = searchParams.get('file')
        //   if (file?.startsWith('http')) {
        //     recordData.meta.fileUrl = file
        //   }
        // }

        const encryptedData = aesJsonEncrypt(recordData)
        const token = await getMaxAIChromeExtensionAccessToken()
        console.log(`recordData`, recordData)
        clientFetchAPI(`${APP_USE_CHAT_GPT_API_HOST}/app/post_pseo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            info: encryptedData,
          }),
        })
          .then()
          .catch()
      }

      this.output = params.LAST_ACTION_OUTPUT || ''
    } catch (e) {
      this.error = (e as any).toString()
    }
  }
}
