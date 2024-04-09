import { debounce } from 'lodash-es'
import React, { FC, useCallback, useEffect, useRef } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import { v4 } from 'uuid'

import { useCreateClientMessageListener } from '@/background/utils'
import {
  isProduction,
  MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
} from '@/constants'
import {
  FloatingDropdownMenuLastFocusRangeState,
  FloatingDropdownMenuState,
  RangyState,
} from '@/features/contextMenu'
import { useGoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'
import {
  IRangyRect,
  IVirtualIframeSelectionElement,
} from '@/features/contextMenu/types'
import {
  IGoogleDocRect,
  isRectChange,
  mergeRects,
} from '@/features/contextMenu/utils/googleDocHelper'

const id = v4()

const GoogleDocMask: FC = () => {
  const { control, caret, selection } = useGoogleDocContext()

  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const setFloatingDropdownMenuLastFocusRange = useSetRecoilState(
    FloatingDropdownMenuLastFocusRangeState,
  )
  const setRangy = useSetRecoilState(RangyState)
  const selectionRef = useRef<Record<string, HTMLElement | null>>({})
  const getRectRef = useRef<() => IRangyRect>()
  const messageRef = useRef<IVirtualIframeSelectionElement>()
  const caretRef = useRef(caret)
  caretRef.current = caret
  const floatingDropdownMenuRef = useRef(floatingDropdownMenu)
  floatingDropdownMenuRef.current = floatingDropdownMenu

  /**
   * 模拟iframe.tsx里的事件，触发context menu的功能
   */
  const postMessage = useCallback((rect: IGoogleDocRect, content: string) => {
    messageRef.current = {
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
      eventType: 'keyup',
      isEmbedPage: false,
      isEditableElement: true,
      caretOffset: 1,
      startMarkerId: '',
      endMarkerId: '',
    }
    window.postMessage(
      {
        id: MAXAI_CHROME_EXTENSION_POST_MESSAGE_ID,
        type: 'iframeSelection',
        data: messageRef.current,
      },
      '*',
    )
  }, [])

  /**
   * menu隐藏时编辑框重新获得焦点
   */
  useEffect(() => {
    if (floatingDropdownMenu.open) {
      // 针对快捷键触发的draft text，这里以位置判断是否是由google doc里触发
      // 处理滚动重新计算位置
      if (getRectRef.current || !messageRef.current || !caretRef.current) {
        return;
      }
      if (!isRectChange(floatingDropdownMenuRef.current.rootRect!, messageRef.current?.targetRect)) {
        getRectRef.current = () => caretRef.current?.element.getBoundingClientRect().toJSON()
      }
    } else {
      messageRef.current = undefined
      control?.inputElement?.focus()

      // 每次hide时触发一个MAX_AI_IGNORE的event去覆盖掉useInitRangy.ts里触发的mock space up，否则会导致一些意外的bug
      // saveHighlightedRangeAndShowContextMenu是防抖函数，设置成timeout为1即可覆盖
      let timer: ReturnType<typeof setTimeout> | null = null
      setFloatingDropdownMenuLastFocusRange((prev) => {
        if (prev.range) {
          timer = setTimeout(() => {
            const keyupEvent = new KeyboardEvent('keyup', {
              key: ' ',
              code: 'Space',
              bubbles: true,
              cancelable: true,
            })
            ;(keyupEvent as any).MAX_AI_IGNORE = true
            document.body.dispatchEvent(keyupEvent)
          }, 1)
        }
        return prev
      })

      return () => {
        timer && clearTimeout(timer)
      }
    }
  }, [floatingDropdownMenu.open])

  /**
   * google doc的滚动容器监听事件，重置menu区域
   */
  useEffect(() => {
    if (!control?.editorElement) return

    const onScroll = debounce(() => {
      console.log(111, getRectRef.current)

      if (!getRectRef.current) return

      const rootRect = getRectRef.current()
      setFloatingDropdownMenu((prev) => {
        if (prev.open) {
          return {
            ...prev,
            rootRect,
          }
        }
        return prev
      })
      setRangy((prev) => {
        if (prev.show) {
          return {
            ...prev,
            tempSelection: prev.tempSelection
              ? {
                  ...prev.tempSelection,
                  selectionRect: rootRect,
                }
              : prev.tempSelection,
          }
        }
        return prev
      })
    }, 200)

    control.editorElement.addEventListener('scroll', onScroll)
    return () => {
      control.editorElement?.removeEventListener('scroll', onScroll)
      onScroll.cancel()
    }
  }, [control])

  /**
   * 处理选区/光标变化
   */
  useEffect(() => {
    console.log(1112, selection, caret, focus)
    getRectRef.current = undefined

    console.log('GoogleDoc', selection, caret, focus)

    // 有选区内容
    if (selection && selection.content) {
      getRectRef.current = () =>
        mergeRects(
          Object.values(selectionRef.current)
            .filter(Boolean)
            .map((item) => item!.getBoundingClientRect().toJSON()),
        )
      postMessage(getRectRef.current(), selection.content)
      return
    }

    // 无选区内容判断是否需要清空
    setRangy((prev) => {
      if (prev.show) {
        return {
          show: false,
          tempSelection: null,
          currentSelection: null,
        }
      }
      return prev
    })

    // 获取到焦点，准备好快捷键触发draft new text
    if (caret) {
      postMessage(caret.rect, '')
    }
  }, [selection, caret])

  /**
   * 模拟iframe触发context menu功能，此处添加监听处理各个insert事件
   */
  useCreateClientMessageListener(async (event, data, sender) => {
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
      {caret && (
        <div
          style={{
            position: 'absolute',
            border: '1px solid blue',
            zIndex: isProduction ? 0 : 9999,
            ...caret.layout,
          }}
        />
      )}
    </div>
  )
}

export default GoogleDocMask
