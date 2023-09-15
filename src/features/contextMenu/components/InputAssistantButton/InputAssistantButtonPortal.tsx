import React, { FC, useState } from 'react'
import { createPortal } from 'react-dom'
import InputAssistantButton from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import InputAssistantButtonManager, {
  IInputAssistantButtonObserverData,
} from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import useEffectOnce from '@/hooks/useEffectOnce'
import { CacheProvider } from '@emotion/react'
import createCache from '@emotion/cache'
import { IInputAssistantButtonGroupConfig } from '@/features/contextMenu/components/InputAssistantButton/config'
const AppNameToClassName = String(process.env.APP_ENV || '')
  .toLowerCase()
  .replace(/_/g, '-')
const InputAssistantPortal: FC = () => {
  const [config, setConfig] = useState<IInputAssistantButtonGroupConfig | null>(
    null,
  )
  const [allObserverData, setAllObserverData] = useState<
    IInputAssistantButtonObserverData[]
  >([])
  useEffectOnce(() => {
    const inputAssistantPortal = new InputAssistantButtonManager()
    inputAssistantPortal.createInputAssistantButtonListener(
      (allObserverData, config) => {
        setAllObserverData(allObserverData)
        setConfig(config)
      },
    )
  })

  return (
    <>
      {allObserverData.map((observerData) => {
        const emotionRoot = document.createElement('style')
        const cache = createCache({
          key: `${AppNameToClassName}-context-menu`,
          prepend: true,
          container: emotionRoot,
        })
        observerData.shadowRootElement.appendChild(emotionRoot)
        return createPortal(
          <CacheProvider value={cache}>
            <InputAssistantButton
              rootId={observerData.id}
              buttonGroup={observerData.buttonGroup}
              root={observerData!.renderRootElement as HTMLElement}
              InputAssistantBoxStyle={config?.InputAssistantBoxStyle}
              CTAButtonStyle={config?.CTAButtonStyle}
              DropdownButtonStyle={config?.DropdownButtonStyle}
            />
          </CacheProvider>,
          observerData.renderRootElement,
          observerData.id,
        )
      })}
    </>
  )
}
export default InputAssistantPortal
