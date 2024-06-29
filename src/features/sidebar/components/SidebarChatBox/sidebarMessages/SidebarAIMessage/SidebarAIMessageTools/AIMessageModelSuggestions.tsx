import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IAIProviderType } from '@/background/provider/chat'
import { MAXAI_CHATGPT_MODEL_GPT_4_TURBO } from '@/background/src/chat/UseChatGPTChat/types'
import { checkIsThirdPartyAIProvider } from '@/background/src/chat/util'
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
  title: string
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
  // const GPT_4O: IConversationSuggestAIModel = {
  //   title: 'gpt-4o',
  //   AIProvider: 'USE_CHAT_GPT_PLUS',
  //   AIModel: 'gpt-4o',
  //   description:
  //     'client:sidebar__chat__suggestions__model__description__for_gpt_4_o',
  // }
  // const CLAUDE_3_OPUS: IConversationSuggestAIModel = {
  //   title: 'claude-3-opus',
  //   AIProvider: 'MAXAI_CLAUDE',
  //   AIModel: 'claude-3-opus',
  //   description:
  //     'client:sidebar__chat__suggestions__model__description__for_claude_3_opus',
  // }
  const CLAUDE_3_5_SONNET: IConversationSuggestAIModel = {
    title: 'Claude-3.5-Sonnet',
    AIProvider: 'MAXAI_CLAUDE',
    AIModel: 'claude-3-5-sonnet',
    description:
      'client:sidebar__chat__suggestions__model__description__for_claude_3_opus',
  }
  if (userRoleType === 'elite') {
    if (
      [
        'claude-3-sonnet',
        'claude-3-opus',
        'gpt-4',
        MAXAI_CHATGPT_MODEL_GPT_4_TURBO,
      ].includes(conversationAIModel)
    ) {
      return [CLAUDE_3_5_SONNET]
    }
  } else if (userRoleType === 'pro') {
    if (conversationAIModel !== CLAUDE_3_5_SONNET.AIModel) {
      return [CLAUDE_3_5_SONNET]
    }
  } else {
    if (conversationAIModel !== CLAUDE_3_5_SONNET.AIModel) {
      return [CLAUDE_3_5_SONNET]
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
      !isLastMessage ||
      !isShowSuggestions
    ) {
      return null
    }
    const conversationModel = clientConversation?.meta.AIModel || ''
    const AIProvider = clientConversation?.meta.AIProvider
    // TODO 第三方AIProvider不显示AIModel的推荐
    const models =
      AIProvider && checkIsThirdPartyAIProvider(AIProvider)
        ? []
        : getAIModels(currentUserPlan, conversationModel)
    const suggestions = models.filter(
      (model) => model.AIModel !== messageAIModel,
    )
    let newChatButton: IAIMessageModelSuggestionAIModelButton | null = null
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
      newChatButton = {
        title: ctaButtonAIModel.title,
        AIProvider: ctaButtonAIModel.AIProvider,
        AIModel: ctaButtonAIModel.AIModel,
      }
    }
    return {
      newChatButton,
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
      {memoConfig.newChatButton && (
        <AIMessageSuggestionsAIModelNewChatButton
          newChatButtonConfig={memoConfig.newChatButton}
        />
      )}
      <AIMessageSuggestionsModelSelector suggestions={memoConfig.suggestions} />
    </Stack>
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
  // TODO 目前没有推荐多个
  // const handleClick = (event: React.MouseEvent<HTMLElement>) => {
  //   setAnchorEl(event.currentTarget)
  // }
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
      <AIMessageModelSuggestionButton
        type={'Compare'}
        disabled={smoothConversationLoading}
        AIModel={firstSuggestion.AIModel}
        AIProvider={firstSuggestion.AIProvider}
        title={firstSuggestion.title}
        onClick={async () => {
          await handleRegenerateAIModel(firstSuggestion.AIModel)
        }}
      />
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

const AIMessageSuggestionsAIModelNewChatButton: FC<{
  newChatButtonConfig: IAIMessageModelSuggestionAIModelButton
}> = (props) => {
  const { newChatButtonConfig } = props
  const {
    showConversationLoading,
    hideConversationLoading,
    createConversation,
  } = useClientConversation()
  const { smoothConversationLoading } = useSmoothConversationLoading()
  const handleClick = async () => {
    try {
      if (!newChatButtonConfig.AIModel) {
        return
      }
      showConversationLoading()
      await createConversation(
        'Chat',
        newChatButtonConfig.AIProvider,
        newChatButtonConfig.AIModel,
      )
    } catch (e) {
      console.error(e)
    } finally {
      hideConversationLoading()
    }
  }
  return (
    <AIMessageModelSuggestionButton
      type={'NewChat'}
      onClick={handleClick}
      disabled={smoothConversationLoading}
      title={newChatButtonConfig.title}
      AIModel={newChatButtonConfig.AIModel}
      AIProvider={newChatButtonConfig.AIProvider}
    />
  )
}

const AIMessageModelSuggestionButton: FC<{
  type: 'Compare' | 'NewChat'
  title: string
  AIModel: string
  AIProvider?: IAIProviderType
  onClick?: () => void
  disabled?: boolean
}> = (props) => {
  const { t } = useTranslation(['client'])
  const { onClick, type, disabled, AIModel, AIProvider, title } = props
  return (
    <Stack
      component={'button'}
      onClick={onClick}
      disabled={disabled}
      sx={{
        fontSize: '14px',
        padding: 0,
        color: 'primary.main',
        borderRadius: '8px',
        border: '1px solid',
        bgcolor: 'transparent',
        borderColor: 'customColor.borderColor',
        cursor: 'pointer',
        overflow: 'hidden',
        '&:hover': {
          backgroundColor: (t) =>
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.08)'
              : 'rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Stack direction={'row'} alignItems={'center'}>
        <Stack
          sx={{
            p: '4px 8px',
            borderRight: '1px solid',
            borderColor: 'customColor.borderColor',
            fontSize: '14px',
            lineHeight: '20px',
            fontWeight: 400,
            color: 'text.secondary',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(86,82,82,0.6)'
                : 'rgba(0,0,0,0.08)',
          }}
        >
          {type === 'Compare' &&
            t('client:sidebar__chat__suggestions__compare_to__title')}
          {type === 'NewChat' &&
            t('client:sidebar__chat__suggestions__starts_new_chat__title')}
        </Stack>
        <Stack
          direction={'row'}
          alignItems={'center'}
          sx={{
            gap: '4px',
            p: '4px 8px',
          }}
        >
          <AIModelIcons
            size={18}
            aiProvider={AIProvider}
            aiModelValue={AIModel}
          />
          <Typography
            fontSize={'14px'}
            color={'text.primary'}
            fontWeight={400}
            lineHeight={'20px'}
          >
            {title}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  )
}

export default AIMessageModelSuggestions
