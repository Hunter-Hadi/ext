import React, { FC, useEffect } from 'react'
import { useRecoilValue } from 'recoil'
import { v4 } from 'uuid'

import { createClientMessageListener } from '@/background/utils'
import { MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID } from '@/constants'
import { FloatingDropdownMenuSystemItemsState } from '@/features/contextMenu'
import { useGoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'
import { getDraftContextMenuTypeById } from '@/features/contextMenu/utils'
import { mergeRects } from '@/features/contextMenu/utils/googleDocHelper'

const id = v4()

const GoogleDocMask: FC = () => {
  const { control, selection, selectionTexts } = useGoogleDocContext()

  const floatingDropdownMenuSystemItems = useRecoilValue(
    FloatingDropdownMenuSystemItemsState,
  )

  useEffect(() => {
    const selectedDraftContextMenuType = getDraftContextMenuTypeById(
      floatingDropdownMenuSystemItems.selectContextMenuId || '',
    )
    console.log(
      'GoogleDocSelectContextMenuIdChange',
      selectedDraftContextMenuType,
    )
    if (!selectedDraftContextMenuType) return
    if (['DISCARD', 'COPY'].includes(selectedDraftContextMenuType)) {
      console.log('GoogleDocFocus')
      control?.inputElement?.focus()
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])

  useEffect(() => {
    if (!selection || !selection.rects.length) return

    const content = control?.copySelection()

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
          selectionText: content,
          selectionHTML: content,
          editableElementSelectionText: content,
          editableElementSelectionHTML: content,
          eventType: 'mouseup',
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

    // google doc的滚动不是以document.body,
    // 每次滚动时重新计算context menu位置
    const onScroll = () => {}

    control.editorElement.addEventListener('scroll', onScroll)

    return () => {
      control.editorElement?.removeEventListener('scroll', onScroll)
    }
  }, [selection])

  createClientMessageListener(async (event, data, sender) => {
    console.log('GoogleDocClientMessage', event, data)
    if (event !== 'Client_listenUpdateIframeInput') return undefined
    const { type, value } = data
    switch (type) {
      case 'INSERT_BLOW':
        break
      case 'INSERT':
        break
      case 'INSERT_ABOVE':
        break
      case 'REPLACE_SELECTION':
        break
    }
    control?.replaceSelection(value)
  })

  return (
    <div>
      {selectionTexts.map((item, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            ...item.style,
          }}
        >
          {item.content}
        </span>
      ))}

      {selection?.rects.map((item, i) => {
        const layout = control?.calculateRelativeLayout(item)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: layout?.top,
              left: layout?.left,
              width: item.width,
              height: item.height,
              border: '1px solid red',
              zIndex: 9999,
            }}
          />
        )
      })}
    </div>
  )
}

export default GoogleDocMask
