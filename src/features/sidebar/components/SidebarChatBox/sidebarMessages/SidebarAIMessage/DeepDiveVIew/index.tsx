import Stack from '@mui/material/Stack'
import React, { FC, useMemo, useRef } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import CustomMarkdown from '@/components/CustomMarkdown'
import { IAIResponseOriginalMessageMetaDeep } from '@/features/chatgpt/types'

import { messageListContainerId } from '../../../SidebarChatBoxMessageListContainer'
import { MetadataTitleRender } from '..'
import { HeightUpdateScrolling } from '../HeightUpdateScrolling'

interface IDeepDiveVIew {
  data:
    | IAIResponseOriginalMessageMetaDeep
    | IAIResponseOriginalMessageMetaDeep[]
  isDarkMode?: boolean
}
const DeepDiveVIew: FC<IDeepDiveVIew> = (props) => {
  const chatMessageRef = useRef<HTMLDivElement>(null)
  const maxHeight = useMemo(() => {
    if (chatMessageRef) {
      const otherViewHeight = 380 //临时简单计算，待优化
      const minViewHeight = 350
      const messageListContainerHeight = chatMessageRef.current?.closest(
        `#${messageListContainerId}`,
      )?.clientHeight
      if (
        messageListContainerHeight &&
        messageListContainerHeight > otherViewHeight
      ) {
        return messageListContainerHeight - otherViewHeight
      } else {
        return minViewHeight
      }
    } else {
      return 0
    }
  }, [chatMessageRef.current])
  const deepDiveList = useMemo(() => {
    if (Array.isArray(props.data)) {
      return props.data
    } else {
      return [props.data]
    }
  }, [props.data])
  return (
    <React.Fragment>
      {deepDiveList.map((deepDive, index) => (
        <Stack spacing={1} key={index}>
          {deepDive.title && <MetadataTitleRender title={deepDive.title} />}
          {(!deepDive.type || deepDive.type === 'text') && (
            <div
              className={`markdown-body ${
                props.isDarkMode ? 'markdown-body-dark' : ''
              }`}
            >
              <AppSuspenseLoadingLayout>
                <CustomMarkdown>{deepDive.value}</CustomMarkdown>
              </AppSuspenseLoadingLayout>
            </div>
          )}
          {deepDive.type === 'transcript' && (
            <div
              ref={chatMessageRef}
              className={`markdown-body ${
                props.isDarkMode ? 'markdown-body-dark' : ''
              }`}
            >
              <HeightUpdateScrolling height={maxHeight}>
                <CustomMarkdown>{deepDive.value}</CustomMarkdown>
              </HeightUpdateScrolling>
            </div>
          )}
        </Stack>
      ))}
    </React.Fragment>
  )
}
export default DeepDiveVIew
