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

const GoogleDocInject: FC = () => {
  const control = useMemo(() => new GoogleDocControl(), [])

  const [caret, setCaret] = useState(control.lastCaret)
  const [selection, setSelection] = useState(control.lastSelection)
  const [focus, setFocus] = useState(false)

  useEffectOnce(() => {
    control.init()

    if (control.disabled) return

    const onSelectionChange = (lastSelection: IGoogleDocSelection | null) => {
      setSelection(lastSelection)
    }

    const onCaretChange = (lastCaret: IGoogleDocCaret | null) => {
      setCaret(lastCaret)
    }

    const onFocus = () => {
      setFocus(true)
    }

    const onBlur = () => {
      setFocus(false)
    }

    control.addListener(IGoogleDocEventType.SELECTION_CHANGE, onSelectionChange)
    control.addListener(IGoogleDocEventType.CARET_CHANGE, onCaretChange)
    control.addListener(IGoogleDocEventType.FOCUS, onFocus)
    control.addListener(IGoogleDocEventType.BLUR, onBlur)

    if (control.isFocus()) {
      control.checkSelectionChange()
      control.checkCaretChange()
      setFocus(true)
    }

    return () => {
      control.removeListener(
        IGoogleDocEventType.SELECTION_CHANGE,
        onSelectionChange,
      )
      control.removeListener(IGoogleDocEventType.CARET_CHANGE, onCaretChange)
      control.removeListener(IGoogleDocEventType.FOCUS, onFocus)
      control.removeListener(IGoogleDocEventType.BLUR, onBlur)
      control.destroy()
    }
  })

  if (!control || !control.scrollElement || control.disabled) return null

  return (
    <GoogleDocContext.Provider value={{ control, caret, selection, focus }}>
      {createPortal(<GoogleDocMask />, control.scrollElement)}
    </GoogleDocContext.Provider>
  )
}

export default React.memo(GoogleDocInject)
