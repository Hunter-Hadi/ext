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
    postTagName: string
  }
  constructor(
    post: ISocialMediaPost,
    options?: {
      postTagName?: string
    },
  ) {
    const { postTagName = '[Post]' } = options || {}
    this.config = {
      postTagName,
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
    const postText = `${this.config.postTagName}\n**Author:** ${author}
**Post:**
${content}`
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
  /**
   * @deprecated
   */
  generateMarkdownText() {
    try {
      const { content, author } = this.post
      const commentsData = createCommentListData(this.commentList?.[0] || [])
      // 回复评论
      // `
      // ```
      // **Author:**
      // **Date:**
      // **Comment:**
      // ```
      //
      // ---
      //
      // The above comment is the final one in a series of previous comments of a post.
      //
      // Here's the post, delimited by <post></post>:
      // <post>
      // **Author:**
      // **Date:**
      // **Post:**
      // </post>
      //
      // Here are the earlier comments listed in the order they were added, from the very first to the one before the final comment, delimited by <previous_comments></previous_comments>:
      // <previous_questions>
      // Comment index)
      // **Author:**
      // **Date:**
      // **Comment:**
      // index)
      // **Author:**
      // **Date:**
      // **Comment:**
      // </previous_questions>
      //
      // ---`
      if (commentsData) {
        return `\`\`\`
${commentsData.last.text}
\`\`\`

---

The above comment is the final one in a series of previous comments of a post.

Here's the post, delimited by <post></post>:
<post>
**Author:** ${author}
**Post:**
**Post:**
${content}
</post>

Here are the earlier comments listed in the order they were added, from the very first to the one before the final comment, delimited by <previous_comments></previous_comments>:
<previous_comments>
${commentsData.previous}
</previous_comments>

---`
      } else {
        // 回复post
        // `
        // ```
        // **Author:**
        // **Date:**
        // **Post:**
        // ```
        return `\`\`\`
**Author:** ${author}
**Post:**
${content}
\`\`\``
      }
    } catch (e) {
      console.error(e)
      return ''
    }
  }
}
