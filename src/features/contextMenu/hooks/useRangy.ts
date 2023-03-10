import { useRecoilState } from 'recoil'
import { RangyCoreState, RangyState } from '../store'
import { checkIsCanInputElement } from '@/features/contextMenu/utils'

const removeMarkers = () => {
  document.querySelectorAll('.rangySelectionBoundary').forEach((node) => {
    node.remove()
  })
}

const parseRangySelectRangeData = (selectedRange: any) => {
  const range = selectedRange?.ranges?.[0]
  if (!range) {
    return {
      isCanInputElement: false,
      startMarker: null,
      endMarker: null,
      html: '',
      text: '',
    }
  }
  let startMarker = range.startContainer
  let endMarker = range.endContainer
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
      html = range.toHtml()
      text = range.toString()
    } catch (e) {
      console.log('parseRangySelectRangeData error', e)
    }
  }
  if (!text || !html) {
    // 如果没有获取到内容，就直接用缓存的内容
    html = selectedRange?.cache.html
    text = selectedRange?.cache.text
  }
  console.log(
    'parseRangySelectRangeData result',
    selectedRange,
    isCanInputElement,
    'html',
    html,
    'text',
    text,
  )
  return {
    isCanInputElement,
    startMarker,
    endMarker,
    html,
    text,
  }
}

const useRangy = () => {
  const [rangyCore, setRangyCore] = useRecoilState(RangyCoreState)
  const [rangy, setRangy] = useRecoilState(RangyState)
  const hideRangy = (force = false) => {
    setRangy((prevState) => {
      console.log('test selection clear', force, prevState.lastSelectionRanges)
      return {
        ...prevState,
        position: {
          x: 0,
          y: 0,
        },
        show: false,
        tempSelectionRanges: null,
        lastSelectionRanges: force ? null : prevState.lastSelectionRanges,
        selectionInputAble: force ? false : prevState.selectionInputAble,
      }
    })
  }
  const showRangy = (x: number, y: number) => {
    setRangy((prevState) => {
      return {
        ...prevState,
        position: {
          x,
          y,
        },
        show: true,
      }
    })
  }
  const saveTempSelection = () => {
    setRangy((prevState) => {
      if (prevState.tempSelectionRanges?.selection) {
        console.log(
          'test selection clear old marker',
          document.querySelectorAll('.rangySelectionBoundary').length,
        )
        removeMarkers()
      }
      const saved = {
        selection: rangyCore.rangy.saveSelection(),
        selectRange: rangyCore.rangy.getSelection().saveRanges(),
      }
      const data = parseRangySelectRangeData(saved?.selectRange)
      if (saved?.selectRange) {
        saved.selectRange.cache = data
      }
      console.log(
        'test selection save temp',
        saved?.selection?.rangeInfos?.[0]?.startMarkerId,
        saved?.selection?.rangeInfos?.[0]?.endMarkerId,
      )
      return {
        ...prevState,
        tempSelectionRanges: saved || null,
        selectionInputAble: data.isCanInputElement,
      }
    })
  }
  const saveSelection = () => {
    setRangy((prevState) => {
      const temped = prevState.tempSelectionRanges
      let selectionInputAble = false
      if (temped) {
        const selectionData = parseRangySelectRangeData(temped?.selectRange)
        selectionInputAble = selectionData.isCanInputElement
      }
      console.log(
        'test selection save last!!!!',
        temped?.selection?.rangeInfos?.[0]?.startMarkerId,
        temped?.selection?.rangeInfos?.[0]?.endMarkerId,
      )
      return {
        ...prevState,
        selectionInputAble,
        tempSelectionRanges: null,
        lastSelectionRanges: temped || null,
      }
    })
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
    position: rangy.position,
    lastSelectionRanges: rangy.lastSelectionRanges,
    selectionInputAble: rangy.selectionInputAble,
    rangyState: rangy,
  }
}
export { useRangy }
