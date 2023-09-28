export interface ICommentData {
  content: string
  author: string
  date: string
}
// TODO 只支持单条评论树级
export const createCommentListData = (commentList: ICommentData[]) => {
  if (commentList.length > 0) {
    const comments: Array<{
      data: ICommentData
      text: string
    }> = []
    commentList.forEach((commentData, index) => {
      // index代表 # 的数量
      const { content, author } = commentData
      comments.push({
        text: `[Comment ${index + 1}]
**Author:** ${author}
**Comment:**
${content}`,
        data: commentData,
      })
    })
    const last = comments[comments.length - 1]
    const previous = comments.slice(0, comments.length - 1)
    return {
      last,
      lastText: comments[comments.length - 1].text,
      previous,
      previousText: previous.map((comment) => comment.text).join('\n\n'),
      fullText: comments.join('\n\n'),
    }
  }
  return null
}

export interface ISocialMediaPost {
  content: string
  author: string
  date: string
  title: string
}

export interface ISocialMediaPostContextData {
  postText: string
  post?: ISocialMediaPost
  replyCommentText?: string
  replyComment?: ICommentData
  previousComments?: ICommentData[]
  previousCommentsText?: string
  // 社交媒体要回复的Post或者Comment
  SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: string
  // 社交媒体要回复的Post或者Comment用到的上下文
  SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT: string
}

export default class SocialMediaPostContext {
  post: ISocialMediaPost
  commentList: ICommentData[][] = []
  config: {
    postTitle: string
    postContentTagName: string
    meta?: {
      [key in string]: string
    }
  }
  constructor(
    post: ISocialMediaPost,
    options?: {
      postTitle?: string
      postContentTagName?: string
      meta?: {
        [key in string]: string
      }
    },
  ) {
    const {
      postTitle = 'Post',
      postContentTagName = 'Post caption/description',
      meta = {},
    } = options || {}
    this.config = {
      postTitle,
      postContentTagName,
      meta,
    }
    this.post = post
  }
  static get emptyData(): ISocialMediaPostContextData {
    return {
      SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT: '',
      SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: '',
      postText: '',
    }
  }
  addCommentList(commentList: ICommentData[]) {
    this.commentList.push(commentList)
  }

  get data(): ISocialMediaPostContextData {
    const { content, author } = this.post
    const commentsData = createCommentListData(this.commentList?.[0] || [])
    let postText = `[${this.config.postTitle}]\n**Post author:** ${author}
**${this.config.postContentTagName}:**
${content}`
    Object.keys(this.config.meta || {}).forEach((metaKey) => {
      const value = this.config.meta?.[metaKey] || ''
      if (value) {
        postText += `\n**${metaKey}:**:\n${value}`
      }
    })
    if (commentsData?.lastText) {
      return {
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: commentsData.lastText,
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT: commentsData.previousText
          ? `${postText}

${commentsData.previousText}

${commentsData.lastText}`
          : `${postText}

${commentsData.lastText}`,
        post: this.post,
        postText,
        replyCommentText: commentsData.last.text,
        replyComment: commentsData.last.data,
        previousComments: this.commentList?.[0] || [],
        previousCommentsText: commentsData.previousText,
      }
    } else {
      return {
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: postText,
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT_CONTEXT: postText,
        post: this.post,
        postText,
        previousComments: this.commentList?.[0] || [],
        previousCommentsText: commentsData?.previousText,
      }
    }
  }
}
