import { buttonBaseClasses } from '@mui/material/ButtonBase'
import { linkClasses } from '@mui/material/Link'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import {
  MAXAI_CONTEXT_MENU_ID,
  MAXAI_CONTEXT_MENU_PORTAL_ID,
} from '@/features/common/constants'
import { sendMixpanelButtonClickedEvent } from '@/features/mixpanel/utils/mixpanelButtonClicked'
import { getTargetI18nTextByInnerText } from '@/i18n/utils'
import {
  getAppMinimizeContainerElement,
  getMaxAISidebarRootElement,
} from '@/utils'
import { findParentEqualSelector } from '@/utils/dataHelper/elementHelper'

export type IButtonClickedTrackerSceneType = 'minimum' | 'floatingMenu'

/**
 *
 * 通过监听 shadowRoot div 上的点击事件，来记录用户点击的按钮
 *
 * 判断 点击按钮 是否需要被记录的条件:
 *  1. mui button 的元素
 *  2. mui link 的元素
 *  3. 元素上定义了 data-button-clicked-name
 *
 * @param sceneType
 * @returns
 */
const useButtonClickedTracker = (
  sceneType?: IButtonClickedTrackerSceneType,
) => {
  const { i18n } = useTranslation()

  const container = useMemo(() => {
    let container: HTMLElement | null = document.body
    if (sceneType === 'minimum') {
      container = getAppMinimizeContainerElement()
    } else if (sceneType === 'floatingMenu') {
      container =
        document
          .querySelector(`#${MAXAI_CONTEXT_MENU_ID}`)
          ?.shadowRoot?.querySelector(`#${MAXAI_CONTEXT_MENU_PORTAL_ID}`) ??
        null
    } else {
      container = getMaxAISidebarRootElement()
    }

    if (!container) {
      container = document.body
    }
    return container
  }, [sceneType])

  const handleUserInteraction: any = useCallback(
    async (event: React.MouseEvent<HTMLElement>) => {
      const targetElement = event.target as HTMLElement

      // 用户点击的事件才记录
      if (event.isTrusted) {
        const muiTrackElement =
          findParentEqualSelector(
            `.${buttonBaseClasses.root}`,
            targetElement,
            10,
          ) ||
          findParentEqualSelector(`.${linkClasses.root}`, targetElement, 10) ||
          // 如果 element 上定义了 data-button-clicked-name，代表是需要被 tacker 的元素， 并且把 data-button-clicked-name 作为 buttonName
          findParentEqualSelector(
            `*[data-button-clicked-name]`,
            targetElement,
            10,
          )

        if (muiTrackElement) {
          // 需要记录的 buttonName
          // buttonName 优先级
          // 1. data-button-clicked-name
          // 2. data-testid
          // 3. id
          // 4. innerText 去 i18n里找对应的 en text
          let buttonName =
            muiTrackElement.getAttribute('data-button-clicked-name') ||
            muiTrackElement.getAttribute('data-testid') ||
            muiTrackElement.getAttribute('id')

          if (!buttonName) {
            // 没有就用 innerText 去 i18n里找对应的 en text
            const buttonText = muiTrackElement?.innerText || ''
            if (buttonText) {
              const enButtonText = getTargetI18nTextByInnerText(
                i18n,
                buttonText,
              )
              buttonName = enButtonText
            }
          }

          // 有获取到 buttonName 才记录
          console.log(`buttonName`, buttonName, event)
          if (buttonName) {
            await sendMixpanelButtonClickedEvent(buttonName, muiTrackElement, {
              sceneType,
            })
          }
        }
      }
    },
    [i18n, sceneType],
  )

  useEffect(() => {
    if (container) {
      container.addEventListener('click', handleUserInteraction, true)

      return () => {
        container.removeEventListener('click', handleUserInteraction, true)
      }
    }
  }, [container, handleUserInteraction, sceneType])

  return null
}

export default useButtonClickedTracker
