import Action from '@/features/shortcuts/core/Action'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

import { stopActionMessage } from '../../common'

/**
 * @since 2024-03-15
 * @description youtube拿取评论数据,需要根据这个class判断走if逻辑
 */
export class ActionYoutubeGetComments extends Action {
  static type: ActionIdentifier = 'YOUTUBE_GET_COMMENTS'
  constructor(
    id: string,
    type: ActionIdentifier,
    parameters: ActionParameters,
    autoExecute: boolean,
  ) {
    super(id, type, parameters, autoExecute)
  }
  async execute(params: ActionParameters) {
    try {
      const commentList = params.SOCIAL_MEDIA_TARGET_POST_OR_COMMENTS
      if (commentList && commentList.length === 0) {
        //当没有评论直接显示无
        this.output = ''
        return
      } else {
        this.output = commentList?.length
      }
    } catch (e) {
      this.output = ''
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    await stopActionMessage(params)
    return true
  }
}