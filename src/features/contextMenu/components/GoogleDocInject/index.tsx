import React, { FC, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'

import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { GoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'
import GoogleDocMask from '@/features/contextMenu/components/GoogleDocInject/GoogleDocMask'
import {
  GoogleDocControl,
  IGoogleDocCaret,
  IGoogleDocEventType,
  IGoogleDocSelection,
} from '@/features/contextMenu/utils/googleDocHelper'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'

const GoogleDocInject: FC = () => {
  const control = useMemo(() => new GoogleDocControl(), [])

  const [caret, setCaret] = useState<IGoogleDocCaret>()
  const [selection, setSelection] = useState<IGoogleDocSelection>()
  const [selectionTexts, setSelectionTexts] = useState<any[]>([])

  useEffectOnce(() => {
    control.init()

    if (control.disabled) return

    const onSelectionChange = (gDocSelection: IGoogleDocSelection) => {
      const gDocTexts = control.getTextsFromSelection(gDocSelection)
      const content = control.copySelection()

      // 触发context menu
      window.postMessage(
        {
          id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
          type: 'iframeSelection',
          data: {
            virtual: true,
            iframeId: '~',
            tagName: '',
            id: '',
            className: '',
            windowRect: document.body.getBoundingClientRect().toJSON(),
            targetRect: gDocSelection?.rects[0],
            selectionRect: gDocSelection?.rects[0],
            iframeSelectionRect: gDocSelection?.rects[0],
            iframePosition: [0, 0],
            selectionText: content,
            selectionHTML: content,
            editableElementSelectionText: content,
            editableElementSelectionHTML: content,
            eventType: 'mouseup',
            isEmbedPage: false,
            isEditableElement: true,
            caretOffset: 2,
            startMarkerId: '',
            endMarkerId: '',
          },
        },
        '*',
      )

      setSelection(gDocSelection)
      setSelectionTexts(gDocTexts)
    }

    const onCaretChange = (gDocCaret: IGoogleDocCaret) => {
      setCaret(gDocCaret)
    }

    control.addListener(IGoogleDocEventType.SELECTION_CHANGE, onSelectionChange)
    control.addListener(IGoogleDocEventType.CARET_CHANGE, onCaretChange)

    return () => {
      control.removeListener(
        IGoogleDocEventType.SELECTION_CHANGE,
        onSelectionChange,
      )
      control.removeListener(IGoogleDocEventType.CARET_CHANGE, onCaretChange)
      control.destroy()
    }
  })

  if (!control || !control.scrollElement || control.disabled) return null

  return (
    <GoogleDocContext.Provider value={{ control, caret, selection, selectionTexts }}>
      {createPortal(<GoogleDocMask />, control.scrollElement)}
    </GoogleDocContext.Provider>
  )
}

export default React.memo(GoogleDocInject)
