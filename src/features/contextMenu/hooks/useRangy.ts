import { useRecoilState } from 'recoil'
import { RangyCoreState, RangyState } from '@/features/contextMenu/store'
import { ISelection } from '@/features/contextMenu/types'
import { useEffect, useRef } from 'react'

const useRangy = () => {
  const [rangyCore, setRangyCore] = useRecoilState(RangyCoreState)
  const [rangy, setRangy] = useRecoilState(RangyState)
  const hideRangy = (force = false) => {
    setRangy((prevState) => {
      console.log('[ContextMenu Module]: clear', force)
      document.querySelector('#rangeBorderBox')?.remove()
      return {
        show: false,
        tempSelection: null,
        currentSelection: force ? null : prevState.currentSelection,
      }
    })
  }
  const initRangyCore = (rangyCore: any) => {
    setRangyCore({
      loaded: true,
      rangy: rangyCore,
    })
  }
  const showRangy = () => {
    console.log('[ContextMenu Module]: show')
    setRangy((prevState) => {
      return {
        ...prevState,
        show: true,
      }
    })
  }
  const saveTempSelection = (selection: ISelection) => {
    setRangy((prevState) => {
      return {
        ...prevState,
        tempSelection: selection,
      }
    })
  }

  const saveCurrentSelection = (selection: ISelection) => {
    setRangy((prevState) => {
      return {
        ...prevState,
        currentSelection: selection,
      }
    })
  }
  const replaceSelectionRangeText = (text: string) => {
    // try {
    //   if (rangy.lastSelectionRanges) {
    //     const selectionData = parseRangySelectRangeData(
    //       rangy?.lastSelectionRanges?.selectRange,
    //     )
    //     const selection = rangy?.lastSelectionRanges?.selection
    //     const selectionRangeInfos = selection?.rangeInfos?.[0]
    //     if (selectionRangeInfos) {
    //       const selectionStart =
    //         selectionRangeInfos.startMarkerId &&
    //         document.getElementById(selectionRangeInfos.startMarkerId)
    //       const selectionEnd =
    //         selectionRangeInfos.endMarkerId &&
    //         document.getElementById(selectionRangeInfos.endMarkerId)
    //       if (
    //         selectionStart &&
    //         selectionEnd &&
    //         document.body.contains(selectionStart) &&
    //         document.body.contains(selectionEnd)
    //       ) {
    //         const range = rangyCore.rangy.createRange()
    //         range.setStartAfter(selectionStart)
    //         range.setEndBefore(selectionEnd)
    //         range.deleteContents()
    //         text.split(/\r?\n/g).forEach((line, i) => {
    //           // if (i > 0) range.insertNode(document.createElement('br'))
    //           const p = document.createElement('p')
    //           p.innerText = line
    //           range.insertNode(p)
    //         })
    //         // make it highlight
    //         try {
    //           rangyCore.rangy.restoreSelection(selection, true)
    //         } catch (e) {
    //           console.log(e)
    //         }
    //         setTimeout(function () {
    //           if (selectionData?.startMarker?.parentElement?.focus) {
    //             selectionData?.startMarker?.parentElement?.focus()
    //           }
    //         }, 1)
    //         return
    //       }
    //     } else {
    //       const currentRange = rangyCore.rangy?.getSelection()?.getRangeAt(0)
    //       if (currentRange) {
    //         currentRange.deleteContents()
    //         text.split(/\r?\n/g).forEach((line, i) => {
    //           // if (i > 0) currentRange.insertNode(document.createElement('br'))
    //           const p = document.createElement('p')
    //           p.innerText = line
    //           currentRange.insertNode(p)
    //         })
    //         // make currentRange highlight
    //         rangyCore.rangy?.getSelection()?.setSingleRange(currentRange)
    //       }
    //     }
    //   }
    // } catch (e) {
    //   console.error(`replaceSelectionRangeText error :\t`, e)
    // } finally {
    //   hideRangy(true)
    // }
  }
  const tempSelectionRef = useRef<ISelection | null>(rangy.tempSelection)
  useEffect(() => {
    tempSelectionRef.current = rangy.tempSelection
  }, [rangy.tempSelection])
  const currentSelectionRef = useRef<ISelection | null>(rangy.currentSelection)
  useEffect(() => {
    currentSelectionRef.current = rangy.currentSelection
  }, [rangy.currentSelection])
  return {
    showRangy,
    hideRangy,
    rangy: rangyCore.rangy,
    initRangyCore,
    replaceSelectionRangeText,
    saveCurrentSelection,
    saveTempSelection,
    show: rangy.show,
    tempSelection: rangy.tempSelection,
    currentSelection: rangy.currentSelection,
    tempSelectionRef,
    currentSelectionRef,
  }
}
export { useRangy }
