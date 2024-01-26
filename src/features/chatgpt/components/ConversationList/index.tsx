import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import React, { FC, useEffect, useMemo, useState } from 'react'

import { IAIProviderType } from '@/background/provider/chat'
import { PaginationConversation } from '@/background/src/chatConversations'
import ClearAllChatButton from '@/features/chatgpt/components/ConversationList/ClearAllChatButton'
import ClearChatButton from '@/features/chatgpt/components/ConversationList/ClearChatButton'
import AIProviderIcon from '@/features/chatgpt/components/icons/AIProviderIcon'
import useAIProviderModels from '@/features/chatgpt/hooks/useAIProviderModels'
import { clientGetAllPaginationConversations } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IAIProviderModel } from '@/features/chatgpt/types'
import { useFocus } from '@/features/common/hooks/useFocus'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'

const ConversationList: FC = () => {
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const {
    currentSidebarConversationId,
    currentSidebarConversationType,
    updateSidebarSettings,
    updateSidebarConversationType,
  } = useSidebarSettings()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModels()
  const [paginationConversations, setPaginationConversations] = useState<
    PaginationConversation[]
  >([])
  const fetchPaginationConversations = async () => {
    return new Promise<PaginationConversation[]>((resolve) => {
      clientGetAllPaginationConversations()
        .then((conversations) => {
          const beautyConversations = conversations
            // immersive chat 中不显示 Summary history
            .filter((conversation) => !(conversation.type === 'Summary'))
            .sort((prev, next) => {
              return (
                dayjs(next.updated_at).valueOf() -
                dayjs(prev.updated_at).valueOf()
              )
            })
            .map((conversation) => {
              // 美化一下
              let updated_at = conversation.updated_at
              if (dayjs().diff(dayjs(conversation.updated_at), 'days') > 0) {
                updated_at = dayjs(conversation.updated_at).format('MMM DD')
              } else {
                updated_at = dayjs(conversation.updated_at).format('HH:mm')
              }
              // TODO: 本来是直接渲染title的，但是因为现在Chat没有生成title的逻辑，所以先用text代替
              if (conversation.type === 'Chat') {
                conversation.title =
                  conversation.lastMessage.text || conversation.title
              }
              return {
                ...conversation,
                updated_at,
              }
            })

          resolve(beautyConversations)
        })
        .catch((e) => {
          console.log(e)
          resolve([])
        })
    })
  }
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
    <Stack width={0} flex={1} height={'100%'} spacing={1} p={1}>
      <Stack
        flex={1}
        height={0}
        sx={{
          borderBottom: `1px solid`,
          borderColor: 'customColor.borderColor',
          overflowY: 'auto',
        }}
      >
        {filteredPaginationConversations.map((conversation) => {
          const isSelected = conversation.id === currentSidebarConversationId
          // NOTE: 之前发现这里会有不是string的情况，但是没找到原因，这里的代码为了安全性还是留着.
          if (typeof conversation.title !== 'string') {
            conversation.title = JSON.stringify(conversation.title)
          }
          return (
            <Stack
              direction={'row'}
              alignItems={'center'}
              px={2}
              py={1.5}
              key={conversation.id}
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
              }}
              sx={{
                cursor: 'pointer',
                backgroundColor: 'background.paper',
                borderRadius: '4px',
                ...(isSelected
                  ? {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgb(56, 56, 56)'
                          : 'rgb(235, 227, 345)',
                    }
                  : {
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(56,56,56,0.4)'
                            : 'rgba(235,227,255,0.2)',
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
                >
                  <Stack direction={'row'} gap={1} alignItems={'center'}>
                    <Chip
                      sx={{
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
                    color={'text.secondary'}
                    fontSize={'12px'}
                    lineHeight={'16px'}
                  >
                    {conversation.updated_at}
                  </Typography>
                </Stack>
                <Stack direction={'row'} alignItems={'center'}>
                  <Typography
                    color={'text.primary'}
                    fontSize={'14px'}
                    lineHeight={'20px'}
                    noWrap
                    width={0}
                    flex={1}
                  >
                    {conversation.title || conversation.lastMessage?.text}
                  </Typography>
                  {isSelected && (
                    <Stack
                      direction={'row'}
                      alignItems={'center'}
                      flexShrink={0}
                      height={20}
                      gap={0.5}
                    >
                      <ClearChatButton
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
                        conversationId={conversation.id}
                        conversationTitle={
                          conversation.title || conversation.lastMessage?.text
                        }
                      />
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Stack>
          )
        })}
      </Stack>
      <Stack flexShrink={0}>
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
      </Stack>
    </Stack>
  )
}
export default ConversationList
