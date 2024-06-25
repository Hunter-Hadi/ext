import { I18nextKeysType } from '@/i18next'

export type IPageSummaryType =
  | 'PAGE_SUMMARY'
  | 'YOUTUBE_VIDEO_SUMMARY'
  | 'PDF_CRX_SUMMARY'
  | 'DEFAULT_EMAIL_SUMMARY'

export type IPageSummaryNavType =
  | 'all'
  | 'summary'
  | 'keyTakeaways'
  | 'comment'
  | 'transcript'
  | 'actions'
  | 'timestamped'

// 这个字段用于匹配接口的summaryType
// 后端提供的字段summaryType为不同类型的值
export type IPageSummaryNavAPIType =
  | 'standard' // all
  | 'short' // summary
  | 'key_point' // keyTakeaways
  | 'timestamped' // timestamped
  | 'comment' // comment
  | 'action' // actions
  | 'customize' // 自定义prompt

export type IPageSummaryNavItem = {
  // 唯一类型
  key: IPageSummaryNavType
  // 标题
  title: string
  // 图标
  icon: string
  // 配置项
  config?: {
    isAutoScroll?: boolean
  }
  // tooltip内容
  tooltip: I18nextKeysType
}
