/**
 * 用于update modal展示的时候A/B test显示不同的内容，并触发对应的mixpanel
 */
import { useCallback, useMemo, useRef, useState } from 'react'

import {
  getChromeExtensionOnBoardingData,
  setChromeExtensionOnBoardingData,
} from '@/background/utils'
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
    // 未显示过4.6.1的弹窗，4.6.1固定显示gpt-4o-mini的modal
    // 之后会在某个版本删除这个逻辑
    if (!onBoardingData['ON_BOARDING_EXTENSION_VERSION_4_6_1_UPDATE_MODAL']) {
      setCurrentUpdateVariant('gpt-4o-mini')
      return 'all'
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
    // 如果显示过弹窗，代表肯定已经显示过4.6.1的弹窗了，直接改为true
    await setChromeExtensionOnBoardingData(
      'ON_BOARDING_EXTENSION_VERSION_4_6_1_UPDATE_MODAL',
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
