import cloneDeep from 'lodash-es/cloneDeep'

import { backgroundPost } from '@/background/api/backgroundFetch'
import { backgroundGetBetaFeatureSettings } from '@/background/utils/maxAIBetaFeatureSettings/background'
import { getMaxAIChromeExtensionUserId } from '@/features/auth/utils'
import { IConversation } from '@/features/indexed_db/conversations/models/Conversation'

/**
 * 是否开启同步对话的feature
 */
export const isEnableSyncConversation = async () => {
  const settings = await backgroundGetBetaFeatureSettings()
  return settings.chat_sync
}

/**
 * 创建或更新Conversation
 * @param conversation
 */
export const backgroundAddOrUpdateDBConversation = async (
  conversation: IConversation,
) => {
  if (!(await isEnableSyncConversation())) {
    return
  }
  const uploadConversation: any = cloneDeep(conversation)
  if (uploadConversation) {
    if (!uploadConversation.authorId) {
      uploadConversation.authorId = await getMaxAIChromeExtensionUserId()
    }
    // 不需要保存messages
    delete uploadConversation.messages
  }
  await backgroundPost('/conversation/upsert_conversation', uploadConversation)
}
