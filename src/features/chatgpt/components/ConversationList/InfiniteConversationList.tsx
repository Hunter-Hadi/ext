import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import memoize from 'memoize-one'
import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'
import { areEqual, FixedSizeList } from 'react-window'
import InfiniteFixedSizeLoader from 'react-window-infinite-loader'

import { IAIProviderType } from '@/background/provider/chat'
import MoreActionsButton from '@/features/chatgpt/components/ConversationList/MoreActionsButton'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'
import { useAIProviderModelsMap } from '@/features/chatgpt/hooks/useAIProviderModels'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { ClientConversationManager } from '@/features/indexed_db/conversations/ClientConversationManager'
import { IPaginationConversation } from '@/features/indexed_db/conversations/models/Conversation'
import { IAIProviderModel } from '@/features/indexed_db/conversations/models/Message'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { isMaxAIImmersiveChatPage } from '@/utils/dataHelper/websiteHelper'

export interface IInfiniteConversationListProps {
  hasNextPage: boolean
  isNextPageLoading: boolean
  loadNextPage: () => void
  conversations: IPaginationConversation[]
  onSelectItem?: (conversation: IPaginationConversation) => void
}

const createConversationListData = memoize(
  (
    items: IPaginationConversation[],
    onSelectItem?: (conversation?: IPaginationConversation) => void,
    isNextPageLoading?: boolean,
  ) => ({
    items,
    onSelectItem,
    isNextPageLoading,
  }),
)

const InfiniteConversationList: <T>(
  props: IInfiniteConversationListProps<T>,
) => JSX.Element = (props) => {
  const {
    hasNextPage,
    isNextPageLoading,
    loadNextPage,
    conversations,
    onSelectItem,
  } = props
  const itemCount = hasNextPage
    ? conversations.length + 1
    : conversations.length
  const loadMoreItems = async () => {
    if (isNextPageLoading) {
      return
    }
    await loadNextPage()
  }
  const isItemLoaded = (index: number) => {
    return !hasNextPage || index < conversations.length
  }
  const handleSelectItemOrLoadMore = useCallback(
    (conversation?: IPaginationConversation) => {
      if (conversation) {
        onSelectItem?.(conversation)
      } else {
        loadMoreItems()
      }
    },
    [loadMoreItems, onSelectItem],
  )

  const itemData = createConversationListData(
    conversations,
    handleSelectItemOrLoadMore,
    isNextPageLoading,
  )
  return (
    <InfiniteFixedSizeLoader
      isItemLoaded={isItemLoaded}
      itemCount={itemCount}
      loadMoreItems={loadMoreItems}
    >
      {({ onItemsRendered, ref }) => (
        <AutoSizer>
          {({ height, width }: { height: number; width: number }) => (
            <FixedSizeList
              height={height}
              width={width}
              style={{
                flex: 1,
              }}
              itemData={itemData}
              itemSize={60}
              itemCount={itemCount}
              onItemsRendered={onItemsRendered}
              ref={ref}
              className={'maxai--conversation-list'}
              {...props}
            >
              {Row}
            </FixedSizeList>
          )}
        </AutoSizer>
      )}
    </InfiniteFixedSizeLoader>
  )
}

const Row = memo(function RowItem({
  data,
  index,
  style,
}: {
  data: {
    items: IPaginationConversation[]
    onSelectItem?: (conversation?: IPaginationConversation) => void
    isNextPageLoading?: boolean
  }
  index: number
  style: React.CSSProperties
}) {
  // Data passed to List as "itemData" is available as props.data
  const { items, onSelectItem, isNextPageLoading } = data
  const [isHover, setIsHover] = useState(false)
  const [editingConversationId, setEditingConversationId] = useState('')
  const {
    createConversation,
    currentSidebarConversationType,
    currentConversationId,
    disposeBackgroundChatSystem,
    updateConversationId,
  } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const { updateSidebarConversationType, updateSidebarSettings } =
    useSidebarSettings()
  const { AI_PROVIDER_MODEL_MAP } = useAIProviderModelsMap()
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

  const conversation = items[index]
  const isSelected = conversation?.id === currentConversationId
  const editingConversationName = useRef('')
  const handleConversationRename = useCallback(
    async (conversation: IPaginationConversation) => {
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
      }
    },
    [],
  )
  const handleSelectConversation = useCallback(async () => {
    if (smoothConversationLoading) {
      return
    }

    if (conversation.id) {
      // 因为现在有Auto archive功能，所以点击的时候需要更新时间
      ClientConversationManager.addOrUpdateConversation(
        conversation.id,
        {
          updated_at: new Date().toISOString(),
        },
        {
          syncConversationToDB: true,
        },
      )
    }

    switch (conversation.type) {
      case 'ContextMenu':
      case 'Chat':
      case 'Search':
      case 'Art':
        await updateConversationId(conversation.id)
        updateSidebarConversationType(conversation.type)
        break
    }
    //   if (conversation.type === 'Summary') {
    //     // do nothing
    // } else if (conversation.type === 'ContextMenu') {
    //     await updateConversationId(conversation.id)
    //     updateSidebarConversationType(conversation.type)
    //   } else if (conversation.type === 'Chat') {
    //     await updateConversationId(conversation.id)
    //     updateSidebarConversationType(conversation.type)
    //   } else if (conversation.type === 'Search') {
    //     await updateConversationId(conversation.id)
    //     updateSidebarConversationType(conversation.type)
    //   } else if (conversation.type === 'Art') {
    //     await updateConversationId(conversation.id)
    //     updateSidebarConversationType(conversation.type)
    //   }
    // 异步释放Background Conversation
    disposeBackgroundChatSystem(conversation.id).then().catch()
    console.log(`handleSelectConversation 44`, conversation.id)
    onSelectItem?.(conversation)
  }, [conversation, onSelectItem, smoothConversationLoading])
  useEffect(() => {
    if (!conversation && !isNextPageLoading) {
      // 说明是loading
      const timer = setTimeout(() => {
        // 如果已经加载完毕，但是还显示loading，说明有问题
        onSelectItem?.(undefined)
      }, 1000)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [conversation, onSelectItem, isNextPageLoading])
  if (!conversation) {
    return (
      <Stack
        style={style}
        width={'100%'}
        alignItems={'center'}
        justifyContent={'center'}
        sx={{
          my: '16px',
        }}
      >
        <CircularProgress size={16} sx={{ m: '0 auto' }} />
      </Stack>
    )
  }
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
        onClick={handleSelectConversation}
        onMouseOver={() => {
          setIsHover(true)
        }}
        onMouseOut={() => {
          setIsHover(false)
        }}
        sx={{
          cursor: 'pointer',
          backgroundColor: 'background.paper',
          borderRadius: '4px',
          ...(isSelected || editingConversationId === conversation.id
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
                size='small'
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
            {editingConversationId === conversation.id && (
              <ClickAwayListener
                mouseEvent={'onMouseDown'}
                onClickAway={() => handleConversationRename(conversation)}
              >
                <TextField
                  onClick={(event) => {
                    event.stopPropagation()
                  }}
                  data-testid={'maxai--conversation--rename-chat--input'}
                  size={'small'}
                  autoFocus
                  defaultValue={conversation.name}
                  onChange={(event) => {
                    event.stopPropagation()
                    editingConversationName.current = event.target.value.trim()
                  }}
                  onKeyDownCapture={(event) => {
                    event.stopPropagation()
                    if (event.key === 'Enter') {
                      handleConversationRename(conversation)
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
            )}
            {!editingConversationId && (
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
            )}
            {(isSelected || isHover) && (
              <Stack
                direction={'row'}
                alignItems={'center'}
                flexShrink={0}
                height={20}
                gap={0.5}
              >
                <MoreActionsButton
                  conversationAIProvider={conversation?.AIProvider}
                  conversationAIModel={conversation?.AIModel}
                  onRename={() => {
                    setEditingConversationId(conversation.id)
                  }}
                  onDelete={async () => {
                    if (conversation.type === 'ContextMenu') {
                      await createConversation('ContextMenu')
                    } else if (!isMaxAIImmersiveChatPage()) {
                      await updateSidebarSettings({
                        [currentSidebarConversationType.toLowerCase()]: {
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
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  )
}, areEqual)

export default InfiniteConversationList
