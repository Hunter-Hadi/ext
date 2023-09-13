import React, { FC, useState } from 'react'
import { createPortal } from 'react-dom'
import InputAssistantButton from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButton'
import InputAssistantButtonManager, {
  IInputAssistantButtonObserverData,
} from '@/features/contextMenu/components/InputAssistantButton/InputAssistantButtonManager'
import useEffectOnce from '@/hooks/useEffectOnce'
const AppNameToClassName = String(process.env.APP_ENV || '')
  .toLowerCase()
  .replace(/_/g, '-')
const InputAssistantPortal: FC = () => {
  const [allObserverData, setAllObserverData] = useState<
    IInputAssistantButtonObserverData[]
  >([])
  useEffectOnce(() => {
    const inputAssistantPortal = new InputAssistantButtonManager()
    inputAssistantPortal.createInputAssistantButtonListener(setAllObserverData)
  })
  return (
    <>
      {allObserverData.map((observerData) => {
        // const emotionRoot = document.createElement('style')
        // const cache = createCache({
        //   key: `${AppNameToClassName}-context-menu`,
        //   prepend: true,
        //   container: emotionRoot,
        // })
        // observerData.shadowRootElement.appendChild(emotionRoot)
        return createPortal(
          // <CacheProvider value={cache}>
          <InputAssistantButton />,
          // </CacheProvider>,
          document.body,
          observerData.id,
        )
      })}
    </>
  )
}
export default InputAssistantPortal
