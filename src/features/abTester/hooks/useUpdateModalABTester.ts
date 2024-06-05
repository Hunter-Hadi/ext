/**
 * 用于update modal展示的时候A/B test显示不同的内容，并触发对应的mixpanel
 */
import { useMemo } from 'react'

import {
  UPDATE_VARIANT,
  UPDATE_VARIANT_TEMPLATES,
} from '@/features/abTester/constants'

const useUpdateModalABTester = (show: boolean) => {
  const updateVariant = useMemo(() => {
    const randomIndex = Date.now() % UPDATE_VARIANT.length
    return UPDATE_VARIANT[randomIndex]
  }, [show])

  const updateVariantTemplate = UPDATE_VARIANT_TEMPLATES[updateVariant]

  return {
    updateVariant,
    updateVariantTemplate,
  }
}

export default useUpdateModalABTester
