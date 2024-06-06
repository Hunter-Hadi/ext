import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRecoilValue } from 'recoil'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import InputAssistantButton from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import InputAssistantButtonManager, {
  IInputAssistantButtonObserverData,
} from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import { AppDBStorageState } from '@/store'
import { getCurrentDomainHost } from '@/utils/dataHelper/websiteHelper'

const InputAssistantPortal: FC = () => {
  const appSetting = useRecoilValue(AppDBStorageState)
  const [allObserverData, setAllObserverData] = useState<
    IInputAssistantButtonObserverData[]
  >([])
  const inputAssistantPortalRef = useRef<InputAssistantButtonManager | null>(
    null,
  )

  useEffectOnce(() => {
    inputAssistantPortalRef.current = new InputAssistantButtonManager()
    inputAssistantPortalRef.current.createInputAssistantButtonListener(
      (allObserverData) => {
        setAllObserverData(allObserverData)
      },
    )
  })

  const currentPageShow = useMemo(() => {
    // gmail?: boolean
    // outlook?: boolean
    // twitter?: boolean
    // linkedIn?: boolean
    // facebook?: boolean
    // youtube?: boolean
    // instagram?: boolean
    // reddit?: boolean
    // googleMyBusiness?: boolean
    // slack?: boolean
    // discord?: boolean
    // whatsApp?: boolean
    // messenger?: boolean
    // hubspot?: boolean
    const host = getCurrentDomainHost()

    // mail
    if (host === 'mail.google.com') {
      return appSetting.userSettings?.inputAssistantButton?.gmail === true
    }
    if (
      host === 'outlook.live.com' ||
      host === 'outlook.office.com' ||
      host === 'outlook.office365.com'
    ) {
      return appSetting.userSettings?.inputAssistantButton?.outlook === true
    }

    // social media
    if (host === 'twitter.com') {
      return appSetting.userSettings?.inputAssistantButton?.twitter === true
    }
    if (host === 'linkedin.com') {
      return appSetting.userSettings?.inputAssistantButton?.linkedIn === true
    }
    if (host === 'facebook.com') {
      return appSetting.userSettings?.inputAssistantButton?.facebook === true
    }
    if (host === 'youtube.com' || host === 'studio.youtube.com') {
      return appSetting.userSettings?.inputAssistantButton?.youtube === true
    }
    if (host === 'instagram.com') {
      return appSetting.userSettings?.inputAssistantButton?.instagram === true
    }
    if (host === 'reddit.com') {
      return appSetting.userSettings?.inputAssistantButton?.reddit === true
    }

    // chat app
    if (host === 'discord.com') {
      return appSetting.userSettings?.inputAssistantButton?.discord === true
    }
    if (host === 'app.slack.com') {
      return appSetting.userSettings?.inputAssistantButton?.slack === true
    }
    if (host === 'web.whatsapp.com') {
      return appSetting.userSettings?.inputAssistantButton?.whatsApp === true
    }
    if (host === 'web.telegram.org') {
      return appSetting.userSettings?.inputAssistantButton?.telegram === true
    }
    if (host === 'messenger.com') {
      return appSetting.userSettings?.inputAssistantButton?.messenger === true
    }
    return false
  }, [appSetting.userSettings?.inputAssistantButton])

  useEffect(() => {
    if (inputAssistantPortalRef.current) {
      if (currentPageShow) {
        inputAssistantPortalRef.current?.continue()
      } else {
        inputAssistantPortalRef.current?.pause()
      }
    }
  }, [currentPageShow])

  return (
    <>
      {allObserverData.map((observerData) => {
        return createPortal(
          <InputAssistantButton observerData={observerData} />,
          observerData.renderRootElement,
          observerData.id,
        )
      })}
    </>
  )
}
export default InputAssistantPortal
