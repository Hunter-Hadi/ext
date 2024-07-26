import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import React, { FC, useEffect } from 'react'

import ClearAllChatButton from '@/features/chatgpt/components/ConversationList/ClearAllChatButton'
import InfiniteConversationList from '@/features/chatgpt/components/ConversationList/InfiniteConversationList'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import {
  useFetchPaginationConversations,
  useUpgradeConversationsToV3,
} from '@/features/chatgpt/hooks/usePaginationConversations'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import { IPaginationConversation } from '@/features/indexed_db/conversations/models/Conversation'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'

interface IProps {
  conversationType: ISidebarConversationType
  hideClearAllButton?: boolean
  divider?: boolean
  onSelectConversation?: (conversation: IPaginationConversation) => void
  emptyFeedback?: React.ReactNode
  sx?: SxProps
}

const ConversationList: FC<IProps> = (props) => {
  const {
    sx,
    hideClearAllButton = false,
    emptyFeedback = null,
    conversationType,
    onSelectConversation,
  } = props
  const { resetConversation, currentSidebarConversationType } =
    useClientConversation()
  const { updateSidebarSettings, updateSidebarConversationType } =
    useSidebarSettings()

  const { done } = useUpgradeConversationsToV3()
  const {
    loading,
    paginationConversations,
    fetchNextPage,
    hasNextPage,
    isFetching,
    updatePaginationFilter,
  } = useFetchPaginationConversations(
    {
      type: conversationType,
    },
    done,
  )

  // TODO: 删除时清除缓存

  useEffect(() => {
    updatePaginationFilter({
      type: conversationType,
    })
  }, [conversationType])

  return (
    <Stack height={'100%'} spacing={1} p={1} sx={sx}>
      <Stack
        flex={1}
        height={0}
        spacing={1}
        className={'conversation-list'}
        sx={{
          overflowY: 'auto',
        }}
      >
        <AppLoadingLayout loading={loading}>
          <InfiniteConversationList
            conversations={paginationConversations}
            loadNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isNextPageLoading={isFetching}
            onSelectItem={onSelectConversation}
          />
        </AppLoadingLayout>
        {!loading && paginationConversations.length === 0
          ? emptyFeedback
          : null}
      </Stack>
      <Stack
        flexShrink={0}
        sx={{
          borderTop: `1px solid`,
          borderColor:
            // 隐藏了 clear all button 就不需要显示 borderBottom
            hideClearAllButton ? 'transparent' : 'customColor.borderColor',
        }}
      >
        {hideClearAllButton ? null : (
          <ClearAllChatButton
            onDelete={() => {
              const needCleanConversationType =
                currentSidebarConversationType === 'ContextMenu'
                  ? 'contextMenu'
                  : currentSidebarConversationType.toLowerCase()

              updateSidebarSettings({
                [needCleanConversationType]: {
                  conversationId: '',
                },
              }).then(() => {
                switch (needCleanConversationType) {
                  case 'contextMenu': {
                    updateSidebarConversationType('ContextMenu')
                    return
                  }
                  default: {
                    updateSidebarConversationType('Chat')
                  }
                }
              })
              resetConversation()
            }}
          />
        )}
      </Stack>
    </Stack>
  )
}
export default ConversationList
