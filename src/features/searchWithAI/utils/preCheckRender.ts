/**
 * preCheckRender
 *
 * - 预插入标记，用自己的 SEARCH_WITH_AI_ROOT_ID + flag 创建一个div在渲染前插入到body中
 *
 * - 在渲染时，检查是否存在这个标记，如果存在，就不渲染
 */

import {
  SEARCH_WITH_AI_CHECK_FLAG_BACKLIST,
  SEARCH_WITH_AI_ROOT_ID,
} from '../constants'

const toFlagId = (id: string) => id + '_PRE_INJECT_FLAG'

export const preInjectFlag = () => {
  const flagId = toFlagId(SEARCH_WITH_AI_ROOT_ID)
  const div = document.createElement('div')
  div.id = flagId
  div.style.display = 'none'
  document.body.appendChild(div)
}

export const checkInjectedFlag = () => {
  const blackList = SEARCH_WITH_AI_CHECK_FLAG_BACKLIST.map((id) => toFlagId(id))
  const flag = blackList.find((id) => document.getElementById(id))
  return flag
}

export const preCheckCanRender = () => {
  const canRender = !checkInjectedFlag()
  return canRender
}
