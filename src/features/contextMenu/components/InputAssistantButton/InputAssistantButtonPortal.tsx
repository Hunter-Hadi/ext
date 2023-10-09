import React, { FC, useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import InputAssistantButton from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import InputAssistantButtonManager, {
  IInputAssistantButtonObserverData,
} from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import useEffectOnce from '@/hooks/useEffectOnce'
import { IInputAssistantButtonGroupConfig } from '@/features/contextMenu/components/InputAssistantButton/config'
import { useRecoilValue } from 'recoil'
import { AppSettingsState } from '@/store'
import { getCurrentDomainHost } from '@/utils'
const InputAssistantPortal: FC = () => {
  const appSetting = useRecoilValue(AppSettingsState)
  const [config, setConfig] = useState<IInputAssistantButtonGroupConfig | null>(
    null,
  )
  const [allObserverData, setAllObserverData] = useState<
    IInputAssistantButtonObserverData[]
  >([])
  const inputAssistantPortalRef = React.useRef<InputAssistantButtonManager | null>(
    null,
  )
  useEffectOnce(() => {
    inputAssistantPortalRef.current = new InputAssistantButtonManager()
    inputAssistantPortalRef.current.createInputAssistantButtonListener(
      (allObserverData, config) => {
        setAllObserverData(allObserverData)
        setConfig(config)
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
    // hubspot?: boolean
    const host = getCurrentDomainHost()
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
          <InputAssistantButton
            shadowRoot={observerData!.shadowRootElement}
            rootId={observerData.id}
            buttonGroup={observerData.buttonGroup}
            root={observerData!.renderRootElement as HTMLElement}
            InputAssistantBoxSx={config?.InputAssistantBoxSx}
            CTAButtonStyle={config?.CTAButtonStyle}
            DropdownButtonStyle={config?.DropdownButtonStyle}
          />,
          observerData.renderRootElement,
          observerData.id,
        )
      })}
    </>
  )
}
export default InputAssistantPortal
