import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC } from 'react'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IAIResponseOriginalMessageMetaDeepRelatedData } from '@/features/chatgpt/types'

const SidebarAImessageRelatedQuestions: FC<{
  relatedQuestions: IAIResponseOriginalMessageMetaDeepRelatedData[]
}> = (props) => {
  const { relatedQuestions } = props
  const { askAIQuestion } = useClientChat()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  return (
    <Stack>
      {relatedQuestions.map((relatedQuestion, index) => {
        return (
          <MenuItem
            disabled={smoothConversationLoading}
            sx={{
              p: 0,
            }}
            key={index}
            onClick={async () => {
              await askAIQuestion({
                type: 'user',
                text: relatedQuestion.title,
                meta: {
                  includeHistory: true,
                },
              })
            }}
          >
            <Stack width={'100%'}>
              <Divider />
              <Stack
                direction={'row'}
                alignItems={'center'}
                width={'100%'}
                sx={{
                  my: '14px',
                }}
                gap={1}
              >
                <ContextMenuIcon
                  icon={'Search'}
                  sx={{
                    color: 'text.primary',
                    fontSize: '20px',
                  }}
                />
                <Typography
                  fontSize={'16px'}
                  fontWeight={500}
                  width={0}
                  flex={1}
                  noWrap
                  color={'text.primary'}
                >
                  {relatedQuestion.title}
                </Typography>
              </Stack>
            </Stack>
          </MenuItem>
        )
      })}
    </Stack>
  )
}
export default SidebarAImessageRelatedQuestions
