import Chip from '@mui/material/Chip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useRecoilState } from 'recoil'

import { IAIProviderType } from '@/background/provider/chat'
import ClearAllChatButton from '@/features/chatgpt/components/ConversationList/ClearAllChatButton'
import InfiniteFixedSizeLoaderWrapper from '@/features/chatgpt/components/ConversationList/InfiniteFixedSizeLoaderWrapper'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'
import useAIProviderModels, {
  useAIProviderModelsMap,
} from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import usePaginationConversations, {
  useUpgradeConversationsToV3,
} from '@/features/chatgpt/hooks/usePaginationConversations'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { IPaginationConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { ISidebarConversationType } from '@/features/sidebar/types'
import { AppLocalStorageState } from '@/store'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

import MoreActionsButton from './MoreActionsButton'

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
    conversationType,
    sx,
    hideClearAllButton = false,
    onSelectConversation,
    emptyFeedback,
  } = props
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const [appLocalStorage] = useRecoilState(AppLocalStorageState)
  const {
    currentConversationId,
    createConversation,
    updateConversationId,
    resetConversation,
  } = useClientConversation()
  const { updateSidebarSettings, updateSidebarConversationType } =
    useSidebarSettings()
  const { disposeBackgroundChatSystem } = useClientConversation()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  const { updateAIProviderModel } = useAIProviderModels()
  const { done } = useUpgradeConversationsToV3()
  const {
    loading,
    paginationConversations,
    fetchPaginationConversations,
    fetchNextPage,
    hasNextPage,
    isFetching,
    updatePaginationConversations,
    updatePaginationFilter,
  } = usePaginationConversations(
    {
      type: conversationType,
    },
    done,
  )

  const [editingConversationId, setEditingConversationId] = useState('')
  const [hoveringConversationId, setHoveringConversationId] = useState('')
  const editingConversationName = useRef('')

  const modelLabelMap = useMemo(() => {
    const map: {
      [key in IAIProviderType]: {
        [key in string]: string
      }
    } = {} as any
    Object.keys(AI_PROVIDER_MODEL_MAP).forEach((aiProvider: string) => {
      const provider = aiProvider as IAIProviderType
      map[provider] = {}
      const models = AI_PROVIDER_MODEL_MAP[provider]
      models.forEach((model: IAIProviderModel) => {
        map[provider][model.value] = model.title
      })
    })
    return map
  }, [AI_PROVIDER_MODEL_MAP])

  const renderEmptyFeedback = useCallback(() => {
    if (emptyFeedback) {
      return emptyFeedback
    }

    return <></>
  }, [emptyFeedback])

  const handleConversationRename = useCallback(
    async (conversation: IPaginationConversation, index: number) => {
      setEditingConversationId('')
      if (editingConversationName.current !== conversation.name) {
        await ClientConversationManager.addOrUpdateConversation(
          conversation.id,
          {
            name: editingConversationName.current,
          },
          {
            syncConversationToDB: true,
          },
        )
        editingConversationName.current = ''
        await updatePaginationConversations([conversation.id])
      }
    },
    [paginationConversations, editingConversationName.current],
  )
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
          <InfiniteFixedSizeLoaderWrapper
            loadNextPage={() => fetchNextPage()}
            hasNextPage={hasNextPage}
            isNextPageLoading={isFetching}
            items={paginationConversations}
            renderItem={({ index, style }, conversation) => {
              const isSelected = conversation.id === currentConversationId
              return (
                <Stack
                  key={conversation.id}
                  id={`conversation-item-${conversation.id}`}
                  spacing={1}
                  style={style}
                >
                  <Stack
                    direction={'row'}
                    alignItems={'center'}
                    px={2}
                    py={1.5}
                    onClick={async () => {
                      if (smoothConversationLoading) {
                        return
                      }
                      let disposeBackgroundChatSystemConversationId = undefined
                      if (conversation.id) {
                        // 因为现在有Auto archive功能，所以点击的时候需要更新时间
                        await ClientConversationManager.addOrUpdateConversation(
                          conversation.id,
                          {
                            updated_at: new Date().toISOString(),
                          },
                          {
                            syncConversationToDB: true,
                          },
                        )
                      }
                      if (conversation.type === 'Summary') {
                        // do nothing
                      } else if (conversation.type === 'Chat') {
                        disposeBackgroundChatSystemConversationId =
                          appLocalStorage.sidebarSettings?.chat?.conversationId
                        await updateConversationId(conversation.id)
                        updateSidebarConversationType(conversation.type)
                      } else if (conversation.type === 'Search') {
                        disposeBackgroundChatSystemConversationId =
                          appLocalStorage.sidebarSettings?.search
                            ?.conversationId
                        await updateConversationId(conversation.id)
                        updateSidebarConversationType(conversation.type)
                      } else if (conversation.type === 'Art') {
                        disposeBackgroundChatSystemConversationId =
                          appLocalStorage.sidebarSettings?.art?.conversationId
                        await updateConversationId(conversation.id)
                        updateSidebarConversationType(conversation.type)
                      }
                      if (conversation.AIModel && conversation.AIProvider) {
                        await updateAIProviderModel(
                          conversation.AIProvider,
                          conversation.AIModel,
                        )
                      }
                      // 异步释放Background Conversation
                      if (disposeBackgroundChatSystemConversationId) {
                        disposeBackgroundChatSystem(
                          appLocalStorage.sidebarSettings?.chat?.conversationId,
                        )
                          .then()
                          .catch()
                      }
                      onSelectConversation?.(conversation)
                    }}
                    onMouseOver={() => {
                      setHoveringConversationId(conversation.id)
                    }}
                    onMouseOut={() => {
                      setHoveringConversationId('')
                    }}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'background.paper',
                      borderRadius: '4px',
                      ...(isSelected ||
                      editingConversationId === conversation.id
                        ? {
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? 'rgba(255, 255, 255, 0.16)'
                                : 'rgba(144, 101, 176, 0.16)',
                          }
                        : {
                            '&:hover': {
                              bgcolor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.06)'
                                  : 'rgba(144, 101, 176, 0.06)',
                            },
                          }),
                    }}
                    spacing={2}
                  >
                    {conversation.AIModel && (
                      <Stack
                        width={'24px'}
                        height={'24px'}
                        alignItems={'center'}
                        justifyContent={'center'}
                      >
                        <AIModelIcons
                          size={24}
                          aiProvider={conversation.AIProvider}
                          aiModelValue={conversation.AIModel}
                        />
                      </Stack>
                    )}
                    <Stack width={0} flex={1}>
                      <Stack
                        direction={'row'}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                        gap={1}
                      >
                        <Stack
                          direction={'row'}
                          gap={1}
                          alignItems={'center'}
                          flex={1}
                          width={0}
                        >
                          <Chip
                            sx={{
                              flexShrink: 0,
                              width: 'unset',
                              fontSize: '12px',
                              padding: '0!important',
                              height: '16px!important',
                              '& > span': {
                                padding: '0 6px',
                              },
                            }}
                            label={
                              conversation.type === 'ContextMenu'
                                ? 'Context menu'
                                : conversation.type
                            }
                            size="small"
                          />
                          <Typography
                            noWrap
                            flex={1}
                            textAlign={'left'}
                            width={0}
                            color={'text.secondary'}
                            fontSize={'12px'}
                            lineHeight={'16px'}
                          >
                            {modelLabelMap?.[
                              conversation.AIProvider || 'USE_CHAT_GPT_PLUS'
                            ]?.[conversation.AIModel || ''] ||
                              conversation?.AIModel ||
                              ''}
                          </Typography>
                        </Stack>
                        <Typography
                          flexShrink={0}
                          color={'text.secondary'}
                          fontSize={'12px'}
                          lineHeight={'16px'}
                        >
                          {conversation.conversationDisplaysTime}
                        </Typography>
                      </Stack>
                      <Stack direction={'row'} alignItems={'center'}>
                        {editingConversationId === conversation.id ? (
                          <ClickAwayListener
                            mouseEvent={'onMouseDown'}
                            onClickAway={() =>
                              handleConversationRename(conversation, index)
                            }
                          >
                            <TextField
                              data-testid={
                                'maxai--conversation--rename-chat--input'
                              }
                              size={'small'}
                              autoFocus
                              defaultValue={conversation.name}
                              onChange={(event) => {
                                event.stopPropagation()
                                editingConversationName.current =
                                  event.target.value.trim()
                              }}
                              onKeyDownCapture={(event) => {
                                event.stopPropagation()
                                if (event.key === 'Enter') {
                                  handleConversationRename(conversation, index)
                                }
                              }}
                              onPaste={(event) => {
                                event.stopPropagation()
                              }}
                              sx={{
                                width: '100%',
                                mt: '1.5px',
                                mb: '-5.625px',
                                '& input': {
                                  p: '2px 2px 2px 4px',
                                  fontSize: '14px',
                                },
                              }}
                            />
                          </ClickAwayListener>
                        ) : (
                          <>
                            <Typography
                              color={'text.primary'}
                              fontSize={'14px'}
                              lineHeight={'20px'}
                              noWrap
                              width={0}
                              flex={1}
                              textAlign={'left'}
                            >
                              {conversation.conversationDisplaysText}
                            </Typography>
                            {(isSelected ||
                              hoveringConversationId === conversation.id) && (
                              <Stack
                                direction={'row'}
                                alignItems={'center'}
                                flexShrink={0}
                                height={20}
                                gap={0.5}
                              >
                                <MoreActionsButton
                                  conversationAIProvider={
                                    conversation?.AIProvider
                                  }
                                  conversationAIModel={conversation?.AIModel}
                                  onRename={() => {
                                    editingConversationName.current =
                                      conversation.name
                                    setEditingConversationId(conversation.id)
                                  }}
                                  onDelete={async () => {
                                    if (conversationType === 'ContextMenu') {
                                      await createConversation('ContextMenu')
                                    } else if (!isMaxAIImmersiveChatPage()) {
                                      await updateSidebarSettings({
                                        [conversationType.toLowerCase()]: {
                                          conversationId: '',
                                        },
                                      })
                                    }
                                  }}
                                  conversationType={conversation.type}
                                  conversationId={conversation.id}
                                  conversationDisplaysText={
                                    conversation.conversationDisplaysText
                                  }
                                />
                              </Stack>
                            )}
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              )
            }}
          />
        </AppLoadingLayout>
        {!loading && paginationConversations.length === 0
          ? renderEmptyFeedback()
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
              fetchPaginationConversations().then((conversations) => {
                const needCleanConversationType = conversationType.toLowerCase()
                updateSidebarSettings({
                  [needCleanConversationType]: {
                    conversationId: '',
                  },
                }).then(() => {
                  updateSidebarConversationType('Chat')
                })
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
