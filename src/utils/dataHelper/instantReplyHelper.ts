import { isSupportWebComponent } from '@/utils/dataHelper/elementHelper'

export const getInstantReplyDataHelper = () => {
  let instantReplyDataHelper = document.querySelector<HTMLElement>(
    'maxai-instant-reply-data-helper, div[role="maxai-instant-reply-data-helper"]',
  )
  if (!instantReplyDataHelper) {
    const supportWebComponent = isSupportWebComponent()
    if (supportWebComponent) {
      instantReplyDataHelper = document.createElement(
        'maxai-instant-reply-data-helper',
      )
    } else {
      instantReplyDataHelper = document.createElement('div')
      instantReplyDataHelper.setAttribute(
        'role',
        'maxai-instant-reply-data-helper',
      )
    }
    instantReplyDataHelper.style.cssText =
      'width:0!important;height:0!important;display:none!important;position:absolute!important;opacity:0!important;visibility:hidden!important;z-index:-9999!important;overflow:hidden!important;pointer-events:none!important;'
    document.body.appendChild(instantReplyDataHelper)
  }
  return instantReplyDataHelper
}
