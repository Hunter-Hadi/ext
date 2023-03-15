import { useRecoilState } from 'recoil'
import { RangyCoreState, RangyState } from '@/features/contextMenu/store'
import { checkIsCanInputElement } from '@/features/contextMenu/utils'

const removeMarkers = () => {
  document.querySelectorAll('.rangySelectionBoundary').forEach((node) => {
    node.remove()
  })
}

const parseRangySelectRangeData = (selectedRange: any, source = 'useRangy') => {
  console.log(selectedRange)
  if (!selectedRange) {
    return {
      isCanInputElement: false,
      startMarker: null,
      endMarker: null,
      html: '',
      text: '',
    }
  }
  let startMarker = selectedRange.startContainer
  let endMarker = selectedRange.endContainer
  if (!startMarker) {
    // start marker is not exist, but it is the same as last time
    startMarker = selectedRange?.cache.startMarker
  }
  if (!endMarker) {
    // end marker is not exist, but it is the same as last time
    endMarker = selectedRange?.cache.endMarker
  }
  let isCanInputElement = false
  if (selectedRange?.cache) {
    // 如果有缓存的话，先拿缓存的是否可以编辑，因为有可能编辑状态被更新
    isCanInputElement = selectedRange?.cache.isCanInputElement
  }
  if (!isCanInputElement && startMarker) {
    // 如果没有缓存或者缓存的可编辑为false，因为有可能编辑状态被更新，再次获取
    isCanInputElement = checkIsCanInputElement(startMarker || document.body)
  }
  let html = ''
  let text = ''
  if (startMarker && endMarker) {
    try {
      html = selectedRange.toHtml()
      text = selectedRange.toString()
    } catch (e) {
      console.log('parseRangySelectRangeData error', e)
    }
  }
  if (!text || !html) {
    // 如果没有获取到内容，就直接用缓存的内容
    html = selectedRange?.cache?.html || ''
    text = selectedRange?.cache?.text || ''
  }
  console.log(
    `[ContextMenu Module]: parseRangySelectRangeData result[${source}]\n`,
    isCanInputElement,
    '\n',
    // 'html:\t',
    // html,
    '\n',
    'text: \t',
    text,
  )
  if (!selectedRange.cache && html && text) {
    // 如果没有缓存，就缓存一下
    selectedRange.cache = {
      isCanInputElement,
      startMarker,
      endMarker,
      html,
      text,
    }
  }
  return {
    isCanInputElement,
    startMarker,
    endMarker,
    html,
    text,
  }
}
/**
 *
 * @param rangyCore
 * @param saveSelection - 因为会影响键盘操作，所以在点击按钮的时候才save
 */
const rangyGetSelection = (rangyCore: any, saveSelection = false) => {
  try {
    return {
      selection: saveSelection ? rangyCore?.rangy?.saveSelection() : null,
      selectRange: rangyCore?.rangy
        ?.getSelection()
        ?.getRangeAt(0)
        ?.cloneRange(),
    }
  } catch (e) {
    console.log('rangyGetSelection error', e)
    return {
      selection: null,
      selectRange: null,
    }
  }
}

const useRangy = () => {
  const [rangyCore, setRangyCore] = useRecoilState(RangyCoreState)
  const [rangy, setRangy] = useRecoilState(RangyState)
  const hideRangy = (force = false) => {
    setRangy((prevState) => {
      console.log(
        '[ContextMenu Module]: clear',
        force,
        prevState.lastSelectionRanges,
      )
      document.querySelector('#rangeBorderBox')?.remove()
      return {
        ...prevState,
        show: false,
        tempSelectionRanges: null,
        tempSelectRangeRect: null,
        lastSelectionRanges: force ? null : prevState.lastSelectionRanges,
        selectionInputAble: force ? false : prevState.selectionInputAble,
        currentActiveWriteableElement: force
          ? null
          : prevState.currentActiveWriteableElement,
      }
    })
  }
  const showRangy = (rect: any) => {
    console.log('[ContextMenu Module]: show')
    setRangy((prevState) => {
      return {
        ...prevState,
        tempSelectRangeRect: rect,
        show: true,
      }
    })
  }
  const saveTempSelection = (event: MouseEvent | KeyboardEvent) => {
    const saved: any = rangyGetSelection(rangyCore)
    const data = parseRangySelectRangeData(saved?.selectRange)
    saved.event = event
    setRangy((prevState) => {
      if (prevState.tempSelectionRanges?.selection) {
        console.log(
          '[ContextMenu Module]: clear old marker',
          document.querySelectorAll('.rangySelectionBoundary').length,
        )
        removeMarkers()
      }
      console.log('[ContextMenu Module]: save [temp]')
      return {
        ...prevState,
        tempSelectionRanges: saved || null,
        selectionInputAble: data.isCanInputElement,
      }
    })
    return saved
  }
  const saveSelection = () => {
    const currentRanges = rangyCore?.rangy?.getSelection()?.getAllRanges() || []
    let selectionInputAble = false
    if (currentRanges.length > 0 && currentRanges[0].toString()) {
      const saved = rangyGetSelection(rangyCore, true)
      const data = parseRangySelectRangeData(saved?.selectRange)
      console.log(
        '[ContextMenu Module]: saveSelection using [current]',
        saved?.selection?.rangeInfos?.[0]?.startMarkerId,
        saved?.selection?.rangeInfos?.[0]?.endMarkerId,
      )
      setRangy((prevState) => {
        return {
          ...prevState,
          selectionInputAble: data.isCanInputElement,
          tempSelectionRanges: null,
          lastSelectionRanges: saved || null,
        }
      })
      rangyCore.rangy.contextMenu.show()
      return saved
    } else {
      const temped = rangy.tempSelectionRanges
      console.log(
        '[ContextMenu Module]: saveSelection using [temped]',
        temped?.selection?.rangeInfos?.[0]?.startMarkerId,
        temped?.selection?.rangeInfos?.[0]?.endMarkerId,
      )
      if (temped) {
        const selectionData = parseRangySelectRangeData(temped?.selectRange)
        selectionInputAble = selectionData.isCanInputElement
      }
      setRangy((prevState) => {
        return {
          ...prevState,
          selectionInputAble,
          tempSelectionRanges: null,
          lastSelectionRanges: temped || null,
        }
      })
      rangyCore.rangy.contextMenu.show()
      return temped
    }
  }
  const initRangyCore = (rangyCore: any) => {
    setRangyCore({
      loaded: true,
      rangy: rangyCore,
    })
  }
  const replaceSelectionRangeText = (text: string) => {
    try {
      if (rangy.lastSelectionRanges) {
        const selectionData = parseRangySelectRangeData(
          rangy?.lastSelectionRanges?.selectRange,
        )
        const selection = rangy?.lastSelectionRanges?.selection
        const selectionRangeInfos = selection?.rangeInfos?.[0]
        if (selectionRangeInfos) {
          const selectionStart =
            selectionRangeInfos.startMarkerId &&
            document.getElementById(selectionRangeInfos.startMarkerId)
          const selectionEnd =
            selectionRangeInfos.endMarkerId &&
            document.getElementById(selectionRangeInfos.endMarkerId)
          if (
            selectionStart &&
            selectionEnd &&
            document.body.contains(selectionStart) &&
            document.body.contains(selectionEnd)
          ) {
            const range = rangyCore.rangy.createRange()
            range.setStartAfter(selectionStart)
            range.setEndBefore(selectionEnd)
            range.deleteContents()
            text.split(/\r?\n/g).forEach((line, i) => {
              // if (i > 0) range.insertNode(document.createElement('br'))
              const p = document.createElement('p')
              p.innerText = line
              range.insertNode(p)
            })
            // make it highlight
            try {
              rangyCore.rangy.restoreSelection(selection, true)
            } catch (e) {
              console.log(e)
            }
            setTimeout(function () {
              if (selectionData?.startMarker?.parentElement?.focus) {
                selectionData?.startMarker?.parentElement?.focus()
              }
            }, 1)
            return
          }
        } else {
          const currentRange = rangyCore.rangy?.getSelection()?.getRangeAt(0)
          if (currentRange) {
            currentRange.deleteContents()
            text.split(/\r?\n/g).forEach((line, i) => {
              // if (i > 0) currentRange.insertNode(document.createElement('br'))
              const p = document.createElement('p')
              p.innerText = line
              currentRange.insertNode(p)
            })
            // make currentRange highlight
            rangyCore.rangy?.getSelection()?.setSingleRange(currentRange)
          }
        }
      }
    } catch (e) {
      console.error(`replaceSelectionRangeText error :\t`, e)
    } finally {
      hideRangy(true)
    }
  }
  const setActiveWriteableElement = (element: HTMLElement | null) => {
    setRangy((prevState) => {
      return {
        ...prevState,
        currentActiveWriteableElement: element,
      }
    })
  }
  return {
    showRangy,
    hideRangy,
    rangy: rangyCore.rangy,
    initRangyCore,
    saveSelection,
    parseRangySelectRangeData,
    saveTempSelection,
    replaceSelectionRangeText,
    show: rangy.show,
    tempSelectionRanges: rangy.tempSelectionRanges,
    tempSelectRangeRect: rangy.tempSelectRangeRect,
    lastSelectionRanges: rangy.lastSelectionRanges,
    selectionInputAble: rangy.selectionInputAble,
    rangyState: rangy,
    currentActiveWriteableElement: rangy.currentActiveWriteableElement,
    setActiveWriteableElement,
  }
}
export { useRangy }
