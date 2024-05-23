import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

import CustomMarkdown from '@/components/CustomMarkdown'
import { IAIResponseOriginalMessageMetaDeep } from '@/features/indexed_db/conversations/models/Message'
import { messageListContainerId } from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageListContainer'
import { MetadataTitleRender } from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage'
import { HeightUpdateScrolling } from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/HeightUpdateScrolling'
import TranscriptView from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAImessageBottomList/components/SidebarAImessageTimestampedSummary'

interface ISidebarAImessageBottomVIew {
  data:
    | IAIResponseOriginalMessageMetaDeep
    | IAIResponseOriginalMessageMetaDeep[]
  isDarkMode?: boolean
  loading: boolean
}
const SidebarAImessageBottomList: FC<ISidebarAImessageBottomVIew> = (props) => {
  const sidebarAIMessageBottomList = useMemo(() => {
    //props.data 可以是字符串 或 数组
    //目前只有在youtube summary 功能的时候是数组
    if (Array.isArray(props.data)) {
      return props.data
    } else {
      return [props.data]
    }
  }, [props.data])
  return (
    <React.Fragment>
      {sidebarAIMessageBottomList.map((sidebarAIMessageBottomInfo, index) => (
        <Stack spacing={1} key={index}>
          {sidebarAIMessageBottomInfo.title && (
            <MetadataTitleRender title={sidebarAIMessageBottomInfo.title} />
          )}
          {(!sidebarAIMessageBottomInfo.type ||
            sidebarAIMessageBottomInfo.type === 'text') && (
            <div
              className={`markdown-body ${
                props.isDarkMode ? 'markdown-body-dark' : ''
              }`}
            >
              <CustomMarkdown>
                {sidebarAIMessageBottomInfo.value}
              </CustomMarkdown>
            </div>
          )}
          {sidebarAIMessageBottomInfo.type === 'transcript' && (
            <HeightUpdateScrolling
              computeConfig={{
                maxId: `#${messageListContainerId}`,
                otherHeight: 380,
              }}
            >
              <TranscriptView
                transcriptList={sidebarAIMessageBottomInfo.value}
                loading={props.loading}
              />
            </HeightUpdateScrolling>
          )}
          {sidebarAIMessageBottomInfo.type === 'timestampedSummary' && (
            <TranscriptView
              transcriptList={sidebarAIMessageBottomInfo.value}
              loading={props.loading}
            />
          )}
        </Stack>
      ))}
    </React.Fragment>
  )
}
export default SidebarAImessageBottomList
