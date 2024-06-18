import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIProviderType } from '@/background/provider/chat'
import { MAXAI_CHATGPT_MODEL_GPT_4_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import {
  IUserCurrentPlan,
  useUserInfo,
} from '@/features/auth/hooks/useUserInfo'
import AIModelIcons from '@/features/chatgpt/components/icons/AIModelIcons'
import useClientChat, {
  getLastRunShortcuts,
} from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import { I18nextKeysType } from '@/i18next'

export interface IAIMessageModelSuggestionsProps {
  AIMessage: IAIResponseMessage
}

export interface IConversationSuggestAIModel {
  title: string
  description: I18nextKeysType
  AIProvider: IAIProviderType
  AIModel: string
}
export interface IAIMessageModelSuggestionAIModelButton {
  title: I18nextKeysType
  tooltip?: I18nextKeysType
  AIProvider: IAIProviderType
  AIModel: string
}

/**
 * AI Provider 的引导规则
 * @inheritdoc - https://ikjt09m6ta.larksuite.com/docx/WLuqdWQRPoYSBcxra8iuFps4sdS
 * @param userPlan
 * @param conversationAIModel
 */
const getAIModels = (
  userPlan: IUserCurrentPlan,
  conversationAIModel: string,
) => {
  const userRoleType = userPlan.name
  const GPT_4O: IConversationSuggestAIModel = {
    title: 'gpt-4o',
    AIProvider: 'USE_CHAT_GPT_PLUS',
    AIModel: 'gpt-4o',
    description:
      'client:sidebar__chat__suggestions__model__description__for_gpt_4_o',
  }
  const CLAUDE_3_OPUS: IConversationSuggestAIModel = {
    title: 'claude-3-opus',
    AIProvider: 'MAXAI_CLAUDE',
    AIModel: 'claude-3-opus',
    description:
      'client:sidebar__chat__suggestions__model__description__for_claude_3_opus',
  }
  if (userRoleType === 'elite') {
    if (
      ['claude-3-opus', 'gpt-4', MAXAI_CHATGPT_MODEL_GPT_4_TURBO].includes(
        conversationAIModel,
      )
    ) {
      return [GPT_4O]
    }
  } else if (userRoleType === 'pro') {
    if (conversationAIModel !== CLAUDE_3_OPUS.AIModel) {
      return [CLAUDE_3_OPUS]
    }
  } else {
    if (conversationAIModel !== GPT_4O.AIModel) {
      return [GPT_4O]
    }
  }
  return []
}

const AIMessageModelSuggestions: FC<IAIMessageModelSuggestionsProps> = (
  props,
) => {
  const { AIMessage } = props
  const { currentUserPlan, loading } = useUserInfo()
  const { currentSidebarConversationType, clientConversation } =
    useClientConversation()
  const [isShowSuggestions, setIsShowSuggestions] = useState(false)
  const messageAIModel = AIMessage.originalMessage?.metadata?.AIModel || ''
  const memoConfig = useMemo(() => {
    const isLastMessage =
      AIMessage.messageId === clientConversation?.lastMessageId
    if (
      currentSidebarConversationType !== 'Chat' ||
      loading ||
      !isLastMessage
    ) {
      return null
    }
    const conversationModel = clientConversation?.meta.AIModel || ''
    const models = getAIModels(currentUserPlan, conversationModel)
    const suggestions = models.filter(
      (model) => model.AIModel !== messageAIModel,
    )
    let ctaButton: IAIMessageModelSuggestionAIModelButton | null = null
    const ctaButtonAIModel = models.find(
      (model) => model.AIModel === messageAIModel,
    )
    // 当这条消息的AIModel不是当前会话的AIModel时，显示starts with AIModel的按钮
    /// 如果当前的消息的AIModel和会话的AIModel不一样，且没有suggestions时，显示切换到当前AIModel的CTA按钮
    if (
      messageAIModel &&
      messageAIModel !== conversationModel &&
      ctaButtonAIModel &&
      suggestions.length === 0
    ) {
      ctaButton = {
        title: 'client:sidebar__chat__suggestions__starts_new_chat__title',
        AIProvider: ctaButtonAIModel.AIProvider,
        AIModel: ctaButtonAIModel.AIModel,
      }
    }
    return {
      ctaButton,
      suggestions,
    }
  }, [
    AIMessage.messageId,
    clientConversation?.lastMessageId,
    clientConversation?.meta.AIModel,
    currentSidebarConversationType,
    loading,
    currentUserPlan,
    messageAIModel,
    isShowSuggestions,
  ])
  useEffect(() => {
    if (clientConversation?.lastMessageId && clientConversation.id) {
      getLastRunShortcuts(clientConversation.id).then((result) => {
        if (result.lastRunActions.length > 0) {
          setIsShowSuggestions(true)
        } else {
          setIsShowSuggestions(false)
        }
      })
    } else {
      setIsShowSuggestions(false)
    }
  }, [clientConversation?.lastMessageId, clientConversation?.id])
  if (!memoConfig) {
    return null
  }
  return (
    <Stack direction={'row'} alignItems={'center'}>
      <Divider
        orientation='vertical'
        flexItem
        sx={{
          mx: 0.5,
        }}
      />
      {memoConfig.ctaButton && (
        <AIMessageSuggestionsAIModelNewChatButton
          ctaButton={memoConfig.ctaButton}
        />
      )}
      <AIMessageSuggestionsModelSelector suggestions={memoConfig.suggestions} />
    </Stack>
  )
}

const AIMessageSuggestionsAIModelNewChatButton: FC<{
  ctaButton: IAIMessageModelSuggestionAIModelButton
}> = (props) => {
  const { ctaButton } = props
  const { t } = useTranslation(['client'])
  const {
    showConversationLoading,
    hideConversationLoading,
    createConversation,
  } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const handleClick = async () => {
    try {
      if (!ctaButton.AIModel) {
        return
      }
      showConversationLoading()
      await createConversation('Chat', ctaButton.AIProvider, ctaButton.AIModel)
    } catch (e) {
      console.error(e)
    } finally {
      hideConversationLoading()
    }
  }
  return (
    <Button
      onClick={handleClick}
      disabled={smoothConversationLoading}
      sx={{
        padding: 0,
        minWidth: 'unset',
        bgcolor: (t) => (t.palette.mode === 'dark' ? '#282828' : '#EBEBEB'),
        lineHeight: '20px',
        fontSize: '14px',
        color: 'primary.main',
      }}
    >
      <Stack
        direction={'row'}
        alignItems={'center'}
        gap={'4px'}
        sx={{
          p: '1px 4px 1px 2px',
          borderRadius: '8px',
          '&:hover': {
            bgcolor: (t) => (t.palette.mode === 'dark' ? '#282828' : '#D6D6D6'),
          },
        }}
      >
        <AIModelIcons size={18} aiModelValue={ctaButton.AIModel} />
        {t(ctaButton.title as any, {
          AI_MODEL: ctaButton.AIModel,
        })}
      </Stack>
    </Button>
  )
}

const AIMessageSuggestionsModelSelector: FC<{
  suggestions: IConversationSuggestAIModel[]
}> = (props) => {
  const { t } = useTranslation(['client'])
  const {
    showConversationLoading,
    hideConversationLoading,
    currentConversationIdRef,
  } = useClientConversation()
  const { askAIWIthShortcuts } = useClientChat()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const { suggestions } = props
  const firstSuggestion = suggestions[0]
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleRegenerateAIModel = async (AIModel: string) => {
    try {
      if (!currentConversationIdRef.current || !AIModel) {
        return
      }
      showConversationLoading()
      handleClose()
      const { lastRunActionsParams, lastRunActions } =
        await getLastRunShortcuts(currentConversationIdRef.current)
      lastRunActionsParams?.push({
        isBuiltIn: true,
        key: 'MAXAI_SUGGESTION_AI_MODEL',
        overwrite: true,
        value: AIModel,
      })
      await askAIWIthShortcuts(lastRunActions, {
        overwriteParameters: lastRunActionsParams,
        isSaveLastRunShortcuts: true,
        isOpenSidebarChatBox: false,
      })
    } catch (e) {
      console.error(e)
    } finally {
      hideConversationLoading()
    }
  }

  if (!firstSuggestion) {
    return null
  }
  return (
    <div>
      <Button
        disabled={smoothConversationLoading}
        sx={{
          padding: 0,
          minWidth: 'unset',
          bgcolor: (t) => (t.palette.mode === 'dark' ? '#282828' : '#EBEBEB'),
          lineHeight: '20px',
          fontSize: '14px',
          color: 'primary.main',
        }}
      >
        <Stack
          onClick={() => {
            handleRegenerateAIModel(firstSuggestion.AIModel)
          }}
          direction={'row'}
          alignItems={'center'}
          gap={'4px'}
          sx={{
            p: '1px 4px 1px 2px',
            borderRadius: '8px 0 0 8px',
            '&:hover': {
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#282828' : '#D6D6D6',
              '& + div': {
                bgcolor: (t) =>
                  t.palette.mode === 'dark' ? '#282828' : '#D6D6D6',
              },
            },
          }}
        >
          <AIModelIcons size={18} aiModelValue={firstSuggestion.AIModel} />
          {firstSuggestion.title}
        </Stack>
        <Stack
          component={'div'}
          onClick={handleClick}
          direction={'row'}
          alignItems={'center'}
          gap={'4px'}
          sx={{
            borderRadius: '0 8px 8px 0',
            mr: '2px',
            height: '22px',
            '&:hover': {
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? '#282828' : '#D6D6D6',
            },
          }}
        >
          <Divider
            sx={{
              height: '12px',
              m: 'auto',
            }}
            orientation='vertical'
            flexItem
          />
          <KeyboardArrowDownIcon
            sx={{
              fontSize: '16px',
              color: '#858585',
            }}
          />
        </Stack>
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'lock-button',
          role: 'listbox',
          sx: {
            padding: 0,
          },
        }}
        slotProps={{
          paper: {
            sx: {
              boxShadow: `0px 4px 8px 0px rgba(0, 0, 0, 0.16)`,
            },
          },
        }}
      >
        {suggestions.map((suggestionItem) => (
          <MenuItem
            sx={{
              padding: '8px',
            }}
            key={suggestionItem.AIModel}
            onClick={() => handleRegenerateAIModel(suggestionItem.AIModel)}
          >
            <Stack width={'304px'} gap={'4px'}>
              <Stack
                direction={'row'}
                alignItems={'center'}
                width={'100%'}
                gap={'8px'}
              >
                <AIModelIcons size={20} aiModelValue={suggestionItem.AIModel} />
                <Typography
                  fontSize={'14px'}
                  color={'text.primary'}
                  width={0}
                  flex={1}
                  noWrap
                  textAlign={'left'}
                >
                  {suggestionItem.title}
                </Typography>
              </Stack>
              <Stack
                direction={'row'}
                alignItems={'center'}
                width={'100%'}
                gap={'8px'}
              >
                <Typography
                  lineHeight={'18px'}
                  fontSize={'12px'}
                  color={'text.secondary'}
                  width={0}
                  flex={1}
                  noWrap
                  textAlign={'left'}
                >
                  {t(suggestionItem.description as any)}
                </Typography>
              </Stack>
            </Stack>
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}

export default AIMessageModelSuggestions
