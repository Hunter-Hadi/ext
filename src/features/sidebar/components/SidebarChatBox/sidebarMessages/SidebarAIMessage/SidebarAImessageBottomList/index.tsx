import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'
import CustomMarkdown from 'src/components/MaxAIMarkdown'

import AppSuspenseLoadingLayout from '@/components/AppSuspenseLoadingLayout'
import { IAIResponseOriginalMessageMetaDeep } from '@/features/indexed_db/conversations/models/Message'
import { messageListContainerId } from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageListContainer'
import { MetadataTitleRender } from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage'
import { HeightUpdateScrolling } from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/HeightUpdateScrolling'
import SidebarAImessageRelatedQuestions from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAImessageBottomList/components/SidebarAImessageRelatedQuestions'
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
    const bottomList = Array.isArray(props.data) ? props.data : [props.data]
    if (!props.loading) {
      return bottomList.filter((item) => item.title?.titleIcon !== 'Loading')
    }
    return bottomList
  }, [props.data, props.loading])
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
          {sidebarAIMessageBottomInfo.type === 'related' && (
            <AppSuspenseLoadingLayout>
              <SidebarAImessageRelatedQuestions
                relatedQuestions={sidebarAIMessageBottomInfo.value}
              />
            </AppSuspenseLoadingLayout>
          )}
        </Stack>
      ))}
    </React.Fragment>
  )
}
export default SidebarAImessageBottomList
