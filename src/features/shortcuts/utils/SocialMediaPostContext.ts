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
  SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT: string
  // 社交媒体页面内容
  SOCIAL_MEDIA_PAGE_CONTENT: string
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
      SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT: '',
      SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: '',
      SOCIAL_MEDIA_PAGE_CONTENT: '',
      postText: '',
    }
  }
  addCommentList(commentList: ICommentData[]) {
    console.log('simply addCommentList 1',commentList)
    this.commentList.push(commentList)
  }

  get data(): ISocialMediaPostContextData {
    const { content, author, title } = this.post
    console.log('simply addCommentList 2',this.commentList)

    const commentsData = createCommentListData(this.commentList?.[0] || [])
    console.log('simply commentsData',commentsData)

    let postText = ''
    postText += `[${this.config.postTitle}]`
    postText += `\n**Post author:** ${author || 'N/A'}`
    postText += `\n**Post title:** ${title || 'N/A'}`
    postText += `\n**${this.config.postContentTagName}:**\n${content || 'N/A'}`
    let pageContent = ''
    pageContent += `[Page title]: ${title || 'N/A'}`
    pageContent += `\n[Page author]: ${author || 'N/A'}`
    pageContent += `\n[Page content]:\n${content || 'N/A'}`
    Object.keys(this.config.meta || {}).forEach((metaKey) => {
      postText += `\n**${metaKey}:**\n${this.config.meta?.[metaKey] || 'N/A'}`
      pageContent += `\n[${metaKey}]:\n${this.config.meta?.[metaKey] || 'N/A'}`
    })
    if (commentsData?.lastText) {
      return {
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: commentsData.lastText,
        SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT: commentsData.previousText
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
        SOCIAL_MEDIA_PAGE_CONTENT: pageContent,
      }
    } else {
      return {
        SOCIAL_MEDIA_TARGET_POST_OR_COMMENT: postText,
        SOCIAL_MEDIA_POST_OR_COMMENT_CONTEXT: postText,
        post: this.post,
        postText,
        previousComments: this.commentList?.[0] || [],
        previousCommentsText: commentsData?.previousText,
        SOCIAL_MEDIA_PAGE_CONTENT: pageContent,
      }
    }
  }
}
