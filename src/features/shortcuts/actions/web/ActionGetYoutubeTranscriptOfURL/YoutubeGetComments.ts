import { orderBy } from 'lodash-es'

import Action from '@/features/shortcuts/core/Action'
import { IShortcutEngineExternalEngine } from '@/features/shortcuts/types'
import ActionIdentifier from '@/features/shortcuts/types/ActionIdentifier'
import ActionParameters from '@/features/shortcuts/types/ActionParameters'

import { stopActionMessage } from '../../common'

/**
 * @since 2024-03-15
 * @description youtube拿取评论数据,目前未使用，因为 youtube summary comment评论列表功能的显示已被去除
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
      }
      const sortedComments = orderBy(
        commentList ?? [],
        (item) => {
          const value = item.like
          if (value && value.endsWith('K')) {
            return Number(value.slice(0, -1)) * 1000
          }
          return Number(value)
        },
        ['desc'],
      ).filter((item) => item.like !== '0' || item.content !== '') //对like排序
      const commentsText = sortedComments
        .map((comment) => {
          return `**${comment.author}** ${
            comment.like !== '0' ? '👍' + comment.like : ''
          }\n  ${comment.content}\n`
        })
        .join('\n')
      this.output = commentsText || ''
    } catch (e) {
      this.output = ''
    }
  }
  async stop(params: { engine: IShortcutEngineExternalEngine }) {
    await stopActionMessage(params)
    return true
  }
}
