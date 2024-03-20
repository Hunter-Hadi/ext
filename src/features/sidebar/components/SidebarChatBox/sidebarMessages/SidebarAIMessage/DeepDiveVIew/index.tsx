import Stack from '@mui/material/Stack'
import React, { FC, useMemo } from 'react'

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
//DeepDiveVIew 名字需改变
const DeepDiveVIew: FC<IDeepDiveVIew> = (props) => {
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
              className={`markdown-body ${
                props.isDarkMode ? 'markdown-body-dark' : ''
              }`}
            >
              <HeightUpdateScrolling
                computeConfig={{
                  maxId: `#${messageListContainerId}`,
                  otherHeight: 380,
                }}
              >
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
