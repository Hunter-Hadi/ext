import { debounce } from 'lodash-es'
import React, { FC, useEffect, useRef } from 'react'
import { useRecoilValue } from 'recoil'
import { v4 } from 'uuid'

import { IChromeExtensionSendEvent } from '@/background/eventType'
import { createClientMessageListener } from '@/background/utils'
import {
  isProduction,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import { FloatingDropdownMenuSystemItemsState } from '@/features/contextMenu'
import { useGoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'
import { getDraftContextMenuTypeById } from '@/features/contextMenu/utils'
import { mergeRects } from '@/features/contextMenu/utils/googleDocHelper'

const id = v4()

const GoogleDocMask: FC = () => {
  const { control, selection, selectionTexts } = useGoogleDocContext()

  const selectionRef = useRef<Record<string, HTMLElement | null>>({})

  // const setFloatingDropdownMenu = useSetRecoilState(
  //   FloatingDropdownMenuState,
  // )
  const floatingDropdownMenuSystemItems = useRecoilValue(
    FloatingDropdownMenuSystemItemsState,
  )

  useEffect(() => {
    const selectedDraftContextMenuType = getDraftContextMenuTypeById(
      floatingDropdownMenuSystemItems.selectContextMenuId || '',
    )
    if (!selectedDraftContextMenuType) return
    if (['DISCARD', 'COPY'].includes(selectedDraftContextMenuType)) {
      control?.inputElement?.focus()
    }
  }, [floatingDropdownMenuSystemItems.selectContextMenuId])

  useEffect(() => {
    if (!selection || !selection.rects.length) return

    const content = control?.copySelection()

    if (!content) return

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

    // TODO 每次滚动时重新计算context menu位置
    const menuRoot = document.querySelector(
      '#USE_CHAT_GPT_AI_ROOT_Context_Menu',
    )?.shadowRoot
    const miniMenu = menuRoot?.querySelector(
      'div.max-ai__click-context-menu',
    ) as HTMLDivElement
    const onScroll = debounce(() => {
      // setFloatingDropdownMenu(prev => ({
      //   ...prev,
      //   rootRect: mergeRects(
      //     selection.elements.map((item) => item.getBoundingClientRect().toJSON()),
      //   )
      // }))
      const rootRect = mergeRects(
        Object.values(selectionRef.current)
          .filter(Boolean)
          .map((item) => item!.getBoundingClientRect().toJSON()),
      )
      if (miniMenu) {
        miniMenu.style.top = `${rootRect.top + rootRect.height + 8}px`
        miniMenu.style.left = `${rootRect.left}px`
      }
    }, 200)

    control.editorElement.addEventListener('scroll', onScroll)

    return () => {
      control.editorElement?.removeEventListener('scroll', onScroll)
      miniMenu?.style.removeProperty('top')
      miniMenu?.style.removeProperty('left')
    }
  }, [selection])

  useEffect(() => {
    return createClientMessageListener(
      async (event: IChromeExtensionSendEvent, data, sender) => {
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
      },
    )
  }, [])
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
