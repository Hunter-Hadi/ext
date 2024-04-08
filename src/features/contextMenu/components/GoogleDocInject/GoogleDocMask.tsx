import { debounce } from 'lodash-es'
import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'
import { v4 } from 'uuid'

import { useCreateClientMessageListener } from '@/background/utils'
import {
  isProduction,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import {
  FloatingDropdownMenuState,
  FloatingDropdownMenuSystemItemsState,
  useRangy,
} from '@/features/contextMenu'
import { useGoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'
import { getDraftContextMenuTypeById } from '@/features/contextMenu/utils'
import { mergeRects } from '@/features/contextMenu/utils/googleDocHelper'
import { IRangyRect } from '@/features/contextMenu/types'

const id = v4()

const GoogleDocMask: FC = () => {
  const { control, caret, selection } = useGoogleDocContext()

  const selectionRef = useRef<Record<string, HTMLElement | null>>({})

  const { tempSelectionRef, saveTempSelection } = useRangy()

  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const floatingDropdownMenuSystemItems = useRecoilValue(
    FloatingDropdownMenuSystemItemsState,
  )

  console.log('GoogleDoc', 'open', floatingDropdownMenu.open)

  const selectionContent = useMemo(
    () => (selection ? control?.copySelection()?.trim() : null),
    [selection],
  )

  const scrollListener = useCallback((getRect: () => IRangyRect) => {
    if (!control?.editorElement) return

    const onScroll = debounce(() => {
      const rootRect = getRect()
      setFloatingDropdownMenu((prev) => ({
        ...prev,
        rootRect,
      }))
      if (tempSelectionRef.current) {
        saveTempSelection({
          ...tempSelectionRef.current,
          selectionRect: rootRect,
        })
      }
    }, 200)
    control.editorElement.addEventListener('scroll', onScroll)

    return () => {
      control.editorElement?.removeEventListener('scroll', onScroll)
      onScroll.cancel()
    }
  }, [])

  useEffect(() => {
    const selectedDraftContextMenuType = getDraftContextMenuTypeById(
      floatingDropdownMenuSystemItems.selectContextMenuId || '',
    )
    if (!selectedDraftContextMenuType) return
    if (['DISCARD', 'COPY'].includes(selectedDraftContextMenuType)) {
      setTimeout(() => control?.inputElement?.focus(), 0)
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])

  useEffect(() => {
    if (!selection || !selectionContent) {
      // hideRangy()
      return
    }

    const rect = mergeRects(
      selection.elements.map((item) => item.getBoundingClientRect().toJSON()),
    )
    window.postMessage(
      {
        id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
        type: 'iframeSelection',
        data: {
          virtual: true,
          iframeId: id,
          tagName: '',
          id: id,
          className: '',
          windowRect: document.body.getBoundingClientRect().toJSON(),
          targetRect: rect,
          selectionRect: rect,
          iframeSelectionRect: rect,
          iframePosition: [0, 0],
          selectionText: selectionContent,
          selectionHTML: selectionContent,
          editableElementSelectionText: selectionContent,
          editableElementSelectionHTML: selectionContent,
          eventType: 'keyup',
          isEmbedPage: false,
          isEditableElement: true,
          caretOffset: 1,
          startMarkerId: '',
          endMarkerId: '',
        },
      },
      '*',
    )

    if (!control?.editorElement) {
      return
    }

    return scrollListener(() =>
      mergeRects(
        Object.values(selectionRef.current)
          .filter(Boolean)
          .map((item) => item!.getBoundingClientRect().toJSON()),
      ),
    )
  }, [selection, selectionContent])

  useEffect(() => {
    console.log('GoogleDocCaret', caret)
    if (selection && selectionContent) return
    if (!caret) return
    window.postMessage(
      {
        id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
        type: 'iframeSelection',
        data: {
          virtual: true,
          iframeId: id,
          tagName: '',
          id: id,
          className: '',
          windowRect: document.body.getBoundingClientRect().toJSON(),
          targetRect: caret.rect,
          selectionRect: caret.rect,
          iframeSelectionRect: caret.rect,
          iframePosition: [0, 0],
          selectionText: '',
          selectionHTML: '',
          editableElementSelectionText: '',
          editableElementSelectionHTML: '',
          eventType: 'keyup',
          isEmbedPage: false,
          isEditableElement: true,
          caretOffset: 1,
          startMarkerId: '',
          endMarkerId: '',
        },
      },
      '*',
    )
    // return scrollListener(() => caret.element.getBoundingClientRect().toJSON())
  }, [selection, selectionContent, caret])

  useCreateClientMessageListener(async (event, data, sender) => {
    console.log('GoogleDocClientMessage', event, data)
    if (event !== 'Client_listenUpdateIframeInput') return undefined
    const { type, value } = data
    switch (type) {
      case 'INSERT_BELOW':
        control?.insertBelowSelection(value)
        break
      case 'INSERT':
        control?.replaceSelection(value)
        break
      case 'INSERT_ABOVE':
        control?.insertAboveSelection(value)
        break
      case 'REPLACE_SELECTION':
        control?.replaceSelection(value)
        break
    }
  })

  return (
    <div>
      {selection?.layouts.map((item, i) => (
        <div
          ref={(e) => (selectionRef.current[`${i}`] = e)}
          key={i}
          style={{
            position: 'absolute',
            border: '1px solid red',
            zIndex: isProduction ? 0 : 9999,
            ...item,
          }}
        />
      ))}
    </div>
  )
}

export default GoogleDocMask
