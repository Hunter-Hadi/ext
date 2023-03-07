// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rangyLib from 'rangy'
import { useEffect } from 'react'
import initRangyPosition from '../lib/rangy-position'
import { useRangy } from '../hooks'
import debounce from 'lodash-es/debounce'
initRangyPosition(rangyLib)
const useInitRangy = () => {
  const { initRangyCore, rangy, showRangy, saveTempSelection, show } =
    useRangy()
  useEffect(() => {
    let isDestroyed = false
    const initListener = () => {
      if (isDestroyed) return
      initRangyCore(rangyLib)
    }
    rangyLib.init()
    rangyLib.addInitListener(initListener)
    return () => {
      isDestroyed = true
    }
  }, [])
  useEffect(() => {
    const mouseUpListener = debounce(() => {
      if (show) {
        return
      }
      if (rangy?.getSelection()?.toString()?.trim()) {
        const { x } = rangy?.getSelection()?.getStartDocumentPos() || {}
        const { y } = rangy?.getSelection()?.getEndDocumentPos() || {}
        console.log('show rangy', x, y, rangy.getSelection())
        showRangy(x, y)
        saveTempSelection(rangy.getSelection().saveRanges())
      }
    }, 100)

    if (rangy?.initialized) {
      console.log('init mouse event')
      document.addEventListener('mouseup', mouseUpListener)
      document.addEventListener('keyup', mouseUpListener)
    }
    return () => {
      document.removeEventListener('mouseup', mouseUpListener)
      document.removeEventListener('keyup', mouseUpListener)
    }
  }, [rangy, show])
}
export { useInitRangy }
