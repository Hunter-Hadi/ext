import { APP_VERSION } from '@/constants'

// 1st Anniversary 2024 活动 Sidebar Dialog 是否完成弹窗的标识
// 需要与版本号挂钩因为每次插件更新时都需要 重新弹窗
// 每次我们插件跟新，都在sidebar里弹出来一次 - @huangsong
export const ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY = `ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_${APP_VERSION}` as const
