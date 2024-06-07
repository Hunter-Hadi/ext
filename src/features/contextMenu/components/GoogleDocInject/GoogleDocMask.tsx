import debounce from 'lodash-es/debounce'
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
import { IRangyRect } from '@/features/contextMenu/types'
import { mergeRects } from '@/features/contextMenu/utils'
import { IGoogleDocEventType } from '@/features/contextMenu/utils/googleDocController'

const id = v4()

const GoogleDocMask: FC = () => {
  const { control, focus, caret, selection } = useGoogleDocContext()

  const [floatingDropdownMenu, setFloatingDropdownMenu] = useRecoilState(
    FloatingDropdownMenuState,
  )
  const [rangy, setRangy] = useRecoilState(RangyState)
  const setFloatingDropdownMenuLastFocusRange = useSetRecoilState(
    FloatingDropdownMenuLastFocusRangeState,
  )
  const selectionNodeRef = useRef<Record<string, HTMLDivElement | null>>({})
  const caretNodeRef = useRef<HTMLDivElement>(null)
  const floatingDropdownMenuRef = useRef(floatingDropdownMenu)
  floatingDropdownMenuRef.current = floatingDropdownMenu
  const rangyRef = useRef(rangy)
  rangyRef.current = rangy
  const selectionRef = useRef(selection)
  selectionRef.current = selection

  // const setFocus = useRecoilCallback(({ snapshot }) => () => {
  //   const appState = snapshot.getInfo_UNSTABLE(AppState).loadable?.getValue()
  //   // TODO 点击展示sidebar时应该不获取焦点，否则会闪烁一下
  //   if (!appState?.loadedAppSidebar) {
  //     control?.inputElement?.focus()
  //   }
  // })

  const getSelectionRect = useCallback(() => {
    return mergeRects(
      Object.values(selectionNodeRef.current)
        .filter(Boolean)
        .map((item) => item!.getBoundingClientRect().toJSON()),
    )
  }, [])

  const getCaretRect = useCallback(() => {
    return caretNodeRef.current?.getBoundingClientRect().toJSON()
  }, [])

  /**
   * 模拟iframe.tsx里的事件，触发context menu的功能
   */
  const postMessage = useCallback(
    (rect: IRangyRect, content: string, editableContent = content) => {
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
            editableElementSelectionText: editableContent,
            editableElementSelectionHTML: editableContent,
            eventType: 'keyup',
            isEmbedPage: false,
            isEditableElement: !!control?.editable,
            caretOffset: 1,
            startMarkerId: '',
            endMarkerId: '',
          },
        },
        '*',
      )
    },
    [],
  )

  /**
   * menu隐藏时编辑框重新获得焦点
   */
  useEffect(() => {
    if (!floatingDropdownMenu.open) {
      // 每次hide时触发一个MAX_AI_IGNORE的event去覆盖掉useInitRangy.ts里触发的mock space up，否则会导致一些意外的bug
      // saveHighlightedRangeAndShowContextMenu是防抖函数，设置成timeout为1即可覆盖
      const timers: ReturnType<typeof setTimeout>[] = []
      setFloatingDropdownMenuLastFocusRange((prev) => {
        if (prev.range) {
          timers.push(
            setTimeout(() => {
              const keyupEvent = new KeyboardEvent('keyup', {
                key: ' ',
                code: 'Space',
                bubbles: true,
                cancelable: true,
              })
              ;(keyupEvent as any).MAX_AI_IGNORE = true
              document.body.dispatchEvent(keyupEvent)
            }, 1),
          )
        }
        return prev
      })

      // 重新获取光标
      // timers.push(setTimeout(() => setFocus(), 1))
      control?.inputElement?.focus()

      return () => {
        timers.forEach((item) => clearTimeout(item))
      }
    }
  }, [floatingDropdownMenu.open])

  /**
   * google doc的滚动容器监听事件，重置menu区域
   */
  useEffect(() => {
    if (!control) return

    const onScroll = debounce(() => {
      const selectionElement =
        rangyRef.current.currentSelection?.selectionElement ||
        rangyRef.current.tempSelection?.selectionElement

      if (selectionElement?.id !== id) {
        return
      }

      const rootRect = selectionRef.current?.content
        ? getSelectionRect()
        : getCaretRect()

      // 修改悬浮输入菜单位置
      setFloatingDropdownMenu((prev) => {
        return {
          ...prev,
          rootRect,
        }
      })

      // 修改悬浮菜单按钮位置
      setRangy((prev) => {
        return {
          ...prev,
          tempSelection: prev.tempSelection
            ? {
                ...prev.tempSelection,
                selectionRect: rootRect,
              }
            : prev.tempSelection,
        }
      })
    }, 200)

    control.addListener(IGoogleDocEventType.SCROLL, onScroll)
    return () => {
      control.removeListener(IGoogleDocEventType.SCROLL, onScroll)
      onScroll.cancel()
    }
  }, [control])

  /**
   * 处理选区/光标变化
   */
  useEffect(() => {
    if (!focus) {
      return
    }

    // 有选区内容
    if (selection && selection.content) {
      postMessage(mergeRects(selection.rects), selection.content)
      return
    }

    // 获取到焦点，准备好快捷键触发draft new text
    if (caret && focus && control?.editable) {
      postMessage(caret.rect, control?.getCaretBeforeContent(caret) || '', '')
      return
    }

    // 无选区内容判断是否需要清空
    if (rangyRef.current.show) {
      if (!control?.editable) {
        postMessage(getSelectionRect(), '', '')
      }
      setRangy({
        show: false,
        tempSelection: null,
        currentSelection: null,
      })
    }
  }, [selection, caret, focus])

  /**
   * 模拟iframe触发context menu功能，此处添加监听处理各个insert事件
   */
  useCreateClientMessageListener(
    async (event, data, sender): Promise<undefined> => {
      if (event !== 'Client_listenUpdateIframeInput') return
      if (data.id !== id) return
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

  const opacity = isProduction ? 0 : 1
  const zIndex = isProduction ? -1 : 9999

  return (
    <div style={{ opacity }}>
      {selection?.layouts.map((item, i) => (
        <div
          ref={(e) => (selectionNodeRef.current[`${i}`] = e)}
          key={i}
          style={{
            position: 'absolute',
            border: isProduction ? undefined : '1px solid red',
            opacity,
            zIndex,
            ...item,
          }}
        />
      ))}
      {caret && (
        <div
          ref={caretNodeRef}
          style={{
            position: 'absolute',
            border: isProduction ? undefined : '1px solid blue',
            opacity,
            zIndex,
            ...caret.layout,
          }}
        />
      )}
    </div>
  )
}

export default GoogleDocMask
