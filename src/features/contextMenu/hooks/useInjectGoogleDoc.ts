import { useEffect, useRef } from 'react'

import { GoogleDocContext } from '@/features/contextMenu/utils/googleDocHelper'

/**
 * 监听选择框的变化
 */
function useSelectionListener() {
  const textRef = useRef<HTMLSpanElement[]>([])

  useEffect(() => {
    const googleDocContext = new GoogleDocContext()

    const { selectionElement } = googleDocContext

    if (!selectionElement) return

    const mouseUpListener = (event: Event) => {
      textRef.current.forEach((item) => item.remove())
      textRef.current = []

      const selections = googleDocContext.getCurrentSelection()
      if (selections && selections.length) {
        const texts = googleDocContext.getRectsFromSelection(selections)
        const content = texts
          ?.map((item) => item.getAttribute('aria-label'))
          .join('/n')
        googleDocContext.log.info(content)

        // selections.forEach((item) => {
        //   const div = document.createElement('div')
        //   div.style.position = 'absolute'
        //   div.style.top = `${item.top}px`
        //   div.style.left = `${item.left}px`
        //   div.style.width = `${item.width}px`
        //   div.style.height = `${item.height}px`
        //   div.style.border = '1px solid red';
        //   document.body.appendChild(div)
        // })

        texts?.forEach((item) => {
          const { top, left, height } = item.getBoundingClientRect()
          const content = item.getAttribute('aria-label') || ''
          const css = item.getAttribute('data-font-css') || ''
          const span = document.createElement('span')
          const [fontWeight, fontSize, fontFamily] = css.split(' ')
          Object.assign(span.style, {
            position: 'absolute',
            top: `${top}px`,
            left: `${left}px`,
            // width: `${width}px`,
            height: `${height}px`,
            fontSize: fontSize,
            fontWeight: fontWeight,
            fontFamily: fontFamily.replaceAll('"', ''),
            opacity: 0,
          })
          span.innerText = `${content}`
          textRef.current.push(span)
          document.body.appendChild(span)
        })
      }
    }

    const keyUpListener = (event: Event) => {}

    selectionElement.addEventListener('mouseup', mouseUpListener)
    selectionElement.addEventListener('keyup', keyUpListener)
    return () => {
      selectionElement.removeEventListener('mouseup', mouseUpListener)
      selectionElement.removeEventListener('keyup', keyUpListener)
    }
  }, [])
}

export default function useInjectGoogleDoc() {
  useSelectionListener()
}
