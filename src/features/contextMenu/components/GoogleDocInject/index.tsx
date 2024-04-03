import React, { FC, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { GoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'
import GoogleDocMask from '@/features/contextMenu/components/GoogleDocInject/GoogleDocMask'
import {
  GoogleDocControl,
  IGoogleDocSelection,
} from '@/features/contextMenu/utils/googleDocHelper'

const GoogleDocInject: FC = () => {
  const control = useMemo(() => new GoogleDocControl(), [])

  // const [maskContainer, setMaskContainer] = useState<HTMLDivElement | null>(
  //   null,
  // )
  const [selection, setSelection] = useState<IGoogleDocSelection>()
  const [selectionTexts, setSelectionTexts] = useState<any[]>([])

  // useEffectOnce(() => {
  //   const { scrollElement } = control
  //   if (!scrollElement) return
  //
  //   const maskRootElement = document.createElement('div')
  //   maskRootElement.id = 'MAXAI_GOOGLE_DOC_MASK_CONTAINER'
  //   maskRootElement.style.position = 'absolute'
  //   const copyStyles = () => {
  //     const styles = window.getComputedStyle(scrollElement)
  //     ;['left', 'top', 'height', 'width'].forEach((propName) => {
  //       maskRootElement.style.setProperty(
  //         propName,
  //         styles.getPropertyValue(propName),
  //       )
  //     })
  //   }
  //
  //   copyStyles()
  //   scrollElement.parentNode?.appendChild(maskRootElement)
  //   setMaskContainer(maskRootElement)
  //
  //   const observer = new MutationObserver(copyStyles)
  //   observer.observe(scrollElement, { attributes: true })
  //
  //   return () => {
  //     observer.disconnect()
  //     maskRootElement.remove()
  //   }
  // })

  useEffectOnce(() => {
    const { selectionElement } = control

    if (!selectionElement) return

    const mouseUpListener = (event: Event) => {
      const gDocSelection = control.getCurrentSelection()
      const gDocTexts = control.getTextsFromSelection(gDocSelection)
      // control.lastSelection = gDocSelection;
      if (!control.lastSelection && gDocSelection.rects.length) {
        control.lastSelection = gDocSelection
        control.log.info('first', gDocSelection)
      }

      setTimeout(() => {
        if (control.lastSelection) {
          control.selectRectBySelection(control.lastSelection)
        }
      }, 1000)

      setSelection(gDocSelection)
      setSelectionTexts(gDocTexts)
    }

    const keyUpListener = (event: Event) => {}

    selectionElement.addEventListener('mouseup', mouseUpListener)
    selectionElement.addEventListener('keyup', keyUpListener)
    return () => {
      selectionElement.removeEventListener('mouseup', mouseUpListener)
      selectionElement.removeEventListener('keyup', keyUpListener)
    }
  })

  if (!control.scrollElement) return null

  return (
    <GoogleDocContext.Provider value={{ control, selection, selectionTexts }}>
      {createPortal(<GoogleDocMask />, control.scrollElement)}
    </GoogleDocContext.Provider>
  )
}

export default React.memo(GoogleDocInject)
