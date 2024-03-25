import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import CustomMarkdown from '@/components/CustomMarkdown'
import { IAIResponseOriginalMessageMetaDeep } from '@/features/chatgpt/types'

import { messageListContainerId } from '../../../SidebarChatBoxMessageListContainer'
import { MetadataTitleRender } from '..'
import { HeightUpdateScrolling } from '../HeightUpdateScrolling'
import TranscriptView from './components/SidebarAImessageTimestampedSummary'

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
              <AppSuspenseLoadingLayout>
                <CustomMarkdown>
                  {sidebarAIMessageBottomInfo.value}
                </CustomMarkdown>
              </AppSuspenseLoadingLayout>
            </div>
          )}
          {sidebarAIMessageBottomInfo.type === 'transcript' && (
            <HeightUpdateScrolling
              computeConfig={{
                maxId: `#${messageListContainerId}`,
                otherHeight: 380,
              }}
            >
              <AppSuspenseLoadingLayout>
                <TranscriptView
                  transcriptList={sidebarAIMessageBottomInfo.value}
                  loading={props.loading}
                />
              </AppSuspenseLoadingLayout>
            </HeightUpdateScrolling>
          )}
          {sidebarAIMessageBottomInfo.type === 'timestampedSummary' && (
            <AppSuspenseLoadingLayout>
              <TranscriptView
                transcriptList={sidebarAIMessageBottomInfo.value}
                loading={props.loading}
              />
            </AppSuspenseLoadingLayout>
          )}
        </Stack>
      ))}
    </React.Fragment>
  )
}
export default SidebarAImessageBottomList
