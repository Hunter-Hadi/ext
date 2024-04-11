import { Divider } from '@mui/material'
import Chip from '@mui/material/Chip'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { IAIProviderType } from '@/background/provider/chat'
import { PaginationConversation } from '@/background/src/chatConversations'
import ClearAllChatButton from '@/features/chatgpt/components/ConversationList/ClearAllChatButton'
import AIProviderIcon from '@/features/chatgpt/components/icons/AIProviderIcon'
import useAIProviderModels, {
  useAIProviderModelsMap,
} from '@/features/chatgpt/hooks/useAIProviderModels'
import usePaginationConversations from '@/features/chatgpt/hooks/usePaginationConversations'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IAIProviderModel } from '@/features/chatgpt/types'
import { clientUpdateChatConversation } from '@/features/chatgpt/utils/clientChatConversation'
import { useFocus } from '@/features/common/hooks/useFocus'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

import MoreActionsButton from './MoreActionsButton'

interface IProps {
  sx?: SxProps
  hideClearAllButton?: boolean
  divider?: boolean
  onSelectConversation?: (conversation: PaginationConversation) => void
  emptyFeedback?: React.ReactNode
}

const ConversationList: FC<IProps> = ({
  sx,
  hideClearAllButton = false,
  divider = false,
  onSelectConversation,
  emptyFeedback,
}) => {
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const {
    currentSidebarConversationId,
    currentSidebarConversationType,
    updateSidebarSettings,
    updateSidebarConversationType,
  } = useSidebarSettings()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
  const { updateAIProviderModel } = useAIProviderModels()
  const {
    loading,
    paginationConversations,
    setPaginationConversations,
    fetchPaginationConversations,
  } = usePaginationConversations()

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

  const filteredPaginationConversations = useMemo(() => {
    return paginationConversations.filter(
      (conversation) => conversation.type === currentSidebarConversationType,
    )
  }, [currentSidebarConversationType, paginationConversations])

  const renderEmptyFeedback = useCallback(() => {
    if (emptyFeedback) {
      return emptyFeedback
    }

    return <></>
  }, [emptyFeedback])

  const handleConversationRename = useCallback((conversation: PaginationConversation, index: number) => {
    (async () => {
      setEditingConversationId('')
      if (editingConversationName.current !== conversation.name) {
        console.log('testesteditingConversationName', editingConversationName.current, '|', conversation.name)
        await clientUpdateChatConversation(
          conversation.id,
          {
            name: editingConversationName.current,
          },
          false,
        )
        editingConversationName.current = ''
        const conversations = await fetchPaginationConversations();
        setPaginationConversations(conversations)
      }
    })()
  }, [paginationConversations, editingConversationName.current])

  useEffect(() => {
    let destroy = false
    fetchPaginationConversations().then((conversations) => {
      if (destroy) {
        return
      }
      setPaginationConversations(conversations)
    })
    return () => {
      destroy = true
    }
  }, [currentSidebarConversationId, smoothConversationLoading])
  useFocus(() => {
    fetchPaginationConversations().then((conversations) => {
      setPaginationConversations(conversations)
    })
  })
  return (
    <Stack height={'100%'} spacing={1} p={1} sx={sx}>
      <Stack
        flex={1}
        height={0}
        spacing={1}
        className={'conversation-list'}
        sx={{
          borderBottom: `1px solid`,
          borderColor:
            // 隐藏了 clear all button 就不需要显示 borderBottom
            hideClearAllButton ? 'transparent' : 'customColor.borderColor',
          overflowY: 'auto',
        }}
      >
        {filteredPaginationConversations.map((conversation, index) => {
          const isSelected = conversation.id === currentSidebarConversationId
          // NOTE: 之前发现这里会有不是string的情况，但是没找到原因，这里的代码为了安全性还是留着.
          if (typeof conversation.lastMessage.text !== 'string') {
            conversation.lastMessage.text = JSON.stringify(conversation.lastMessage.text)
          }
          const conversationDisplaysText = conversation.name || conversation.lastMessage?.text || conversation.title
          return (
            <Stack
              key={conversation.id}
              id={`conversation-item-${conversation.id}`}
              spacing={1}
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
                  if (conversation.type === 'Summary') {
                    // do nothing
                  } else if (conversation.type === 'Chat') {
                    await updateSidebarSettings({
                      chat: {
                        conversationId: conversation.id,
                      },
                    })
                    updateSidebarConversationType(conversation.type)
                  } else if (conversation.type === 'Search') {
                    await updateSidebarSettings({
                      search: {
                        conversationId: conversation.id,
                      },
                    })
                    updateSidebarConversationType(conversation.type)
                  } else if (conversation.type === 'Art') {
                    await updateSidebarSettings({
                      art: {
                        conversationId: conversation.id,
                      },
                    })
                    updateSidebarConversationType(conversation.type)
                  }
                  if (conversation.AIModel && conversation.AIProvider) {
                    await updateAIProviderModel(
                      conversation.AIProvider,
                      conversation.AIModel,
                    )
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
                  ...((isSelected || editingConversationId === conversation.id)
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
                <Stack
                  width={'24px'}
                  height={'24px'}
                  alignItems={'center'}
                  justifyContent={'center'}
                >
                  <AIProviderIcon
                    size={24}
                    aiProviderType={
                      conversation!.AIProvider || 'USE_CHAT_GPT_PLUS'
                    }
                  />
                </Stack>
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
                          width: '64px',
                          fontSize: '12px',
                          padding: '0!important',
                          height: '16px!important',
                          '& > span': {
                            padding: '0 6px',
                          },
                        }}
                        label={conversation.type}
                        size="small"
                      />
                      <Typography
                        noWrap
                        flex={1}
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
                      {conversation.updated_at}
                    </Typography>
                  </Stack>
                  <Stack direction={'row'} alignItems={'center'}>
                    {
                      editingConversationId === conversation.id ? (
                        <ClickAwayListener
                          mouseEvent={'onMouseDown'}
                          onClickAway={() => handleConversationRename(conversation, index)}
                        >
                          <TextField
                            size={'small'}
                            autoFocus
                            defaultValue={conversation.name}
                            onChange={(event) => {
                              event.stopPropagation();
                              editingConversationName.current = event.target.value.trim()
                            }}
                            onKeyDown={(event) => {
                              event.stopPropagation();
                              if (event.key === 'Enter') { handleConversationRename(conversation, index) }
                            }}
                            onPaste={(event) => {
                              event.stopPropagation();
                            }}
                            sx={{
                              width: '100%',
                              mt: '1.5px',
                              mb: '-5.625px',
                              '& input': {
                                p: '2px 2px 2px 4px',
                                fontSize: '14px',
                              }
                            }}
                          />
                        </ClickAwayListener>
                      ) : <>
                        <Typography
                          color={'text.primary'}
                          fontSize={'14px'}
                          lineHeight={'20px'}
                          noWrap
                          width={0}
                          flex={1}
                          textAlign={'left'}
                        >
                          {conversationDisplaysText}
                        </Typography>
                        {(isSelected || hoveringConversationId === conversation.id) && (
                          <Stack
                            direction={'row'}
                            alignItems={'center'}
                            flexShrink={0}
                            height={20}
                            gap={0.5}
                          >
                            <MoreActionsButton
                              onRename={() => {
                                editingConversationName.current = conversation.name
                                setEditingConversationId(conversation.id)
                              }}
                              onDelete={() => {
                                fetchPaginationConversations().then(
                                  (conversations) => {
                                    setPaginationConversations(conversations)
                                    updateSidebarSettings({
                                      chat: {
                                        conversationId: '',
                                      },
                                    }).then(() => {
                                      updateSidebarConversationType('Chat')
                                    })
                                  },
                                )
                              }}
                              conversationType={conversation.type}
                              conversationId={conversation.id}
                              conversationDisplaysText={
                                conversationDisplaysText
                              }
                            />
                          </Stack>
                        )}
                      </>
                    }
                  </Stack>
                </Stack>
              </Stack>

              {divider &&
                index !== filteredPaginationConversations.length - 1 && (
                  <Divider flexItem />
                )}
            </Stack>
          )
        })}

        {!loading && filteredPaginationConversations.length === 0
          ? renderEmptyFeedback()
          : null}
      </Stack>
      <Stack flexShrink={0}>
        {hideClearAllButton ? null : (
          <ClearAllChatButton
            onDelete={() => {
              fetchPaginationConversations().then((conversations) => {
                setPaginationConversations(conversations)
                const needCleanConversationType = currentSidebarConversationType.toLowerCase()
                updateSidebarSettings({
                  [needCleanConversationType]: {
                    conversationId: '',
                  },
                }).then(() => {
                  updateSidebarConversationType('Chat')
                })
              })
            }}
          />
        )}
      </Stack>
    </Stack>
  )
}
export default ConversationList
