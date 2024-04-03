import React, { FC, useLayoutEffect, useRef } from 'react'

import { useGoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'

const GoogleDocMask: FC = () => {
  const { selection, selectionTexts } = useGoogleDocContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const ref = useRef<Record<number, HTMLElement | null>>({})

  useLayoutEffect(() => {
    if (!selection || !selectionTexts.length) return

    // const windowSelection = window.getSelection()
    // const range = document.createRange()
    // range.setStart(startNode.firstChild, 1)
    // range.setEnd(endNode.firstChild, 4)
    //
    // windowSelection?.removeAllRanges()
    // windowSelection?.addRange(range)
  }, [selection, selectionTexts])

  return (
    <div ref={containerRef}>
      {selectionTexts.map((item, i) => (
        <span
          ref={(e) => (ref.current[i] = e)}
          key={i}
          style={{
            position: 'absolute',
            ...item.style,
          }}
        >
          {item.content}
        </span>
      ))}

      {selection?.rects.map((item, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: item.top,
            left: item.left,
            width: item.width,
            height: item.height,
            border: '1px solid red',
            zIndex: 9999,
          }}
        />
      ))}
    </div>
  )
}

export default GoogleDocMask
