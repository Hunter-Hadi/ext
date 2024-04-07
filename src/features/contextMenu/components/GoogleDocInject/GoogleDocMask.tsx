import React, { FC, useRef } from 'react'

import { IChromeExtensionClientListenEvent } from '@/background/eventType'
import { createClientMessageListener } from '@/background/utils'
import { useGoogleDocContext } from '@/features/contextMenu/components/GoogleDocInject/context'

const GoogleDocMask: FC = () => {
  const { control, selection, selectionTexts } = useGoogleDocContext()

  const containerRef = useRef<HTMLDivElement>(null)
  const ref = useRef<Record<number, HTMLElement | null>>({})

  createClientMessageListener(async (event, data, sender) => {
    switch (event as IChromeExtensionClientListenEvent) {
      case 'Client_listenUpdateIframeInput': {
        const { value } = data
        console.log('GoogleDoc', data)
        control?.replaceSelection(value)
        break
      }
    }
    return undefined
  })

  return (
    <div
      ref={containerRef}
      // style={{
      //   position: 'absolute',
      // }}
      // onMouseDown={(e) => e.stopPropagation()}
      // onMouseMove={(e) => e.stopPropagation()}
      // onMouseUp={(e) => e.stopPropagation()}
      // onKeyDown={(e) => e.stopPropagation()}
      // onKeyUp={(e) => e.stopPropagation()}
    >
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

      {selection?.rects.map((item, i) => {
        const layout = control?.calculateRelativeLayout(item)
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: layout?.top,
              left: layout?.left,
              width: item.width,
              height: item.height,
              border: '1px solid red',
              zIndex: 9999,
            }}
          />
        )
      })}
    </div>
  )
}

export default GoogleDocMask
