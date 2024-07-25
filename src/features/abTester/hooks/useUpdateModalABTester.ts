/**
 * 用于update modal展示的时候A/B test显示不同的内容，并触发对应的mixpanel
 */
import { useCallback, useMemo, useRef, useState } from 'react'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
import { APP_VERSION } from '@/constants'
import {
  UPDATE_VARIANT,
  UPDATE_VARIANT_TEMPLATES,
} from '@/features/abTester/constants'
import {
  IUpdateVariant,
  IUpdateVariantShowType,
} from '@/features/abTester/types'
import { ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY } from '@/features/activity/constants'

const useUpdateModalABTester = () => {
  const [currentUpdateVariant, setCurrentUpdateVariant] =
    useState<IUpdateVariant>()

  const updateVariant = useMemo(() => {
    if (currentUpdateVariant) {
      return currentUpdateVariant
    }
    const randomIndex = Date.now() % UPDATE_VARIANT.length
    return UPDATE_VARIANT[randomIndex]
  }, [currentUpdateVariant])

  const updateVariantTemplate = UPDATE_VARIANT_TEMPLATES[updateVariant]

  const getUpdateShow = useCallback(async (): Promise<
    IUpdateVariantShowType | false
  > => {
    const onBoardingData = await getChromeExtensionOnBoardingData()
    // 未显示过4.8.0的弹窗，4.8.0固定显示llama-3.1-405B的modal
    // 之后会在某个版本删除这个逻辑
    if (!onBoardingData['ON_BOARDING_EXTENSION_VERSION_4_8_0_UPDATE_MODAL']) {
      setCurrentUpdateVariant('llama-3.1-405b')
      return 'all'
    }
    if (APP_VERSION === '4.8.0') {
      return false
    }
    // 弹过了，不弹窗
    if (
      onBoardingData[ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY]
    ) {
      return false
    }
    return 'free'
  }, [])

  const saveUpdateShow = useCallback(async () => {
    // 如果显示过弹窗，代表肯定已经显示过4.8.0的弹窗了，直接改为true
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_EXTENSION_VERSION_4_8_0_UPDATE_MODAL',
      true,
    )
    // 保存默认弹窗的标识
    await setChromeExtensionOnBoardingData(
      ON_BOARDING_1ST_ANNIVERSARY_2024_SIDEBAR_DIALOG_CACHE_KEY,
      true,
    )
  }, [])

  const updateVariantRef = useRef(updateVariant)
  updateVariantRef.current = updateVariant

  return {
    getUpdateShow,
    saveUpdateShow,
    updateVariant,
    updateVariantTemplate,
    updateVariantRef,
  }
}

export default useUpdateModalABTester
