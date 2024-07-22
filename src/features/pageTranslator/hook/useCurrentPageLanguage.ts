import { useCallback, useMemo, useState } from 'react'
import Browser from 'webextension-polyfill'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import { clientRunBackgroundFunction } from '@/utils'

const useCurrentPageLanguage = () => {
  const [loading, setLoading] = useState(true)
  const [currentPageLanguage, setCurrentPageLanguage] = useState<string | null>(
    null,
  )

  const { userSettings } = useUserSettings()

  const clientDetectLanguage = useCallback(async () => {
    const slicedText = document.body.innerText.slice(500, 3000)
    const detectLanguageResponse = await Browser.i18n.detectLanguage(slicedText)

    const languageItem = detectLanguageResponse?.languages?.[0]
    if (
      detectLanguageResponse.isReliable &&
      languageItem &&
      languageItem.percentage > 0 &&
      languageItem.language
    ) {
      return languageItem.language
    }

    return null
  }, [])

  const detectedLanguageWithBackgroundScript = useCallback(async () => {
    const activeTabs =
      (await clientRunBackgroundFunction('tabs', 'query', [
        {
          active: true,
          currentWindow: true,
        },
      ])) || []
    // console.log(`activeTabs`, activeTabs)
    const currentActiveTab = activeTabs[0]
    const tabId = currentActiveTab?.id
    if (currentActiveTab && tabId) {
      const detectResponse = await clientRunBackgroundFunction(
        'tabs',
        'detectLanguage',
        [tabId],
      )
      return detectResponse
    }

    return null
  }, [])

  const currentPageLanguageNotEqualTargetLanguage = useMemo(() => {
    if (
      loading ||
      !userSettings?.pageTranslation?.targetLanguage ||
      !currentPageLanguage
    ) {
      return false
    }

    const targetLanguagePrefix =
      userSettings.pageTranslation.targetLanguage?.split('_')[0]
    const currentPageLanguagePrefix = currentPageLanguage?.split('-')[0]

    // 只需要对比 lang prefix
    return targetLanguagePrefix !== currentPageLanguagePrefix
  }, [
    loading,
    currentPageLanguage,
    userSettings?.pageTranslation?.targetLanguage,
  ])

  useEffectOnce(() => {
    // 加个延迟，不让它影响页面加载速度
    setTimeout(async () => {
      setLoading(true)
      const clientLanguage = await clientDetectLanguage()

      if (clientLanguage) {
        setCurrentPageLanguage(clientLanguage)
        setLoading(false)
        return
      }

      const backgroundScriptLanguage =
        await detectedLanguageWithBackgroundScript()
      if (backgroundScriptLanguage) {
        setCurrentPageLanguage(backgroundScriptLanguage)
        setLoading(false)
        return
      }
    }, 500)
  })

  return {
    currentPageLanguage,
    currentPageLanguageNotEqualTargetLanguage,
  }
}

export default useCurrentPageLanguage
