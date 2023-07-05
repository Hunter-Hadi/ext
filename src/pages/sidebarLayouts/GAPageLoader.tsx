import React, { FC, useEffect, useState } from 'react'
import { CHROME_EXTENSION_HOMEPAGE_URL } from '@/constants'
import { useRecoilValue } from 'recoil'
import { AppState } from '@/store'
import { FloatingDropdownMenuState } from '@/features/contextMenu'

const GAPageLoader: FC = () => {
  const [isLoaded, setIsLoaded] = useState(false)
  const appState = useRecoilValue(AppState)
  const floatingDropdownMenuState = useRecoilValue(FloatingDropdownMenuState)
  useEffect(() => {
    if (appState.open || floatingDropdownMenuState.open) {
      setIsLoaded(true)
    }
  }, [appState.open, floatingDropdownMenuState.open])
  return (
    <>
      {isLoaded && (
        <iframe
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: -1,
            border: 0,
            opacity: 0,
          }}
          width={1}
          height={1}
          id={'EzMail_AI_TEMPLATE_COMPILE'}
          src={`${CHROME_EXTENSION_HOMEPAGE_URL}/crx.html`}
        />
      )}
    </>
  )
}
export default GAPageLoader
