import { useRecoilState } from 'recoil'
import { RangyCoreState, RangyState } from '../store'
import { checkIsCanInputElement } from '@/features/contextMenu/utils'

const useRangy = () => {
  const [rangyCore, setRangyCore] = useRecoilState(RangyCoreState)
  const [rangy, setRangy] = useRecoilState(RangyState)
  const hideRangy = (force = false) => {
    setRangy((prevState) => {
      console.log('!!!!!!!!!!!! clear', force, prevState.lastSelectionRanges)
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
  const saveTempSelection = (saved: any) => {
    setRangy((prevState) => {
      return {
        ...prevState,
        tempSelectionRanges: saved || null,
      }
    })
  }
  const saveSelection = () => {
    setRangy((prevState) => {
      const temped = prevState.tempSelectionRanges
      let selectionInputAble = false
      if (temped && temped.ranges?.[0]?.parentElement()) {
        selectionInputAble = checkIsCanInputElement(
          temped.ranges[0].parentElement(),
        )
        console.log(selectionInputAble, 'selectionInputAble')
      }
      console.log('!!!!!!!!!!!! save', temped)
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
        rangyCore.rangy.getSelection().restoreRanges(rangy.lastSelectionRanges)
        const currentRange = rangyCore.rangy?.getSelection()?.getRangeAt(0)
        if (currentRange) {
          currentRange.deleteContents()
          const span = document.createElement('span')
          const addText = document.createTextNode(text)
          span.appendChild(addText)
          currentRange.insertNode(addText)
          hideRangy(true)
        }
      }
    } catch (e) {
      console.error(`replaceSelectionRangeText error :\t`, e)
    }
  }
  return {
    showRangy,
    hideRangy,
    rangy: rangyCore.rangy,
    initRangyCore,
    saveSelection,
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
