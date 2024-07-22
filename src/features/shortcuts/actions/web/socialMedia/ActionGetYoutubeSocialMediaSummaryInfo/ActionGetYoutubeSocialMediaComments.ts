import { stopActionMessageStatus } from '@/features/shortcuts/actions/utils/actionMessageTool'
import Action from '@/features/shortcuts/core/Action'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

/**
 * @since 2024-03-15
 * @description youtube拿取评论数据,需要根据这个class判断走if逻辑, 该class是否可优化掉
 * @deprecated 目前已经没有地方用到此action，可以删除
 */
export class ActionGetYoutubeSocialMediaComments extends Action {
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
      if (commentList && commentList.length > 0) {
        //当没有评论直接显示无
        this.output = 'ok'
        return
      } else {
        this.output = ''
      }
    } catch (e) {
      this.output = ''
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    await stopActionMessageStatus(params)
    return true
  }
}
