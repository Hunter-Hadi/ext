import React, { FC, useMemo } from 'react'
import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import AIProviderOptions, {
  AIProviderOptionType,
} from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import Typography from '@mui/material/Typography'
import { useRecoilValue, useSetRecoilState } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar/store'
import {
  ChatGPTClientState,
  ThirdPartAIProviderConfirmDialogState,
} from '@/features/chatgpt/store'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import AIProviderAuthCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderAuthCard'
import AIProviderCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { useTranslation } from 'react-i18next'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import AIProviderMainPartIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderMainPartIcon'

interface AIProviderSelectorCardProps {
  sx?: SxProps
  iconSize?: number
  closeAble?: boolean
  onClose?: () => void
}
const AIProviderSelectorCard: FC<AIProviderSelectorCardProps> = (props) => {
  const { sx, iconSize = 20, closeAble, onClose } = props
  const { t } = useTranslation(['common', 'client'])
  const { loading: chatGPTConversationLoading } = useRecoilValue(
    ChatGPTConversationState,
  )
  const clientState = useRecoilValue(ChatGPTClientState)
  const {
    currentSidebarAIProvider,
    updateSidebarSettings,
    currentSidebarConversationType,
  } = useSidebarSettings()
  const {
    cleanConversation,
    createConversation,
    switchBackgroundChatSystemAIProvider,
  } = useClientConversation()

  const setProviderConfirmDialogState = useSetRecoilState(
    ThirdPartAIProviderConfirmDialogState,
  )

  const isLoadingMemo = useMemo(() => {
    return chatGPTConversationLoading
  }, [chatGPTConversationLoading])
  const currentProviderOption = useMemo(() => {
    return AIProviderOptions.find(
      (aiProviderOption) => aiProviderOption.value === currentSidebarAIProvider,
    )
  }, [currentSidebarAIProvider])
  return (
    <Box
      id={closeAble ? 'MaxAIProviderSelectorCard' : ''}
      component={'div'}
      sx={{
        borderRadius: '4px',
        border: '1px solid #EBEBEB',
        boxShadow: '0px 4px 8px 0px rgba(0, 0, 0, 0.16)',
        width: 434,
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        flexDirection: 'row',
        ...sx,
      }}
    >
      <Stack
        sx={{
          p: 1,
          width: 228,
          flexShrink: 0,
          borderRight: '1px solid #EBEBEB',
          alignItems: 'stretch',
          boxSizing: 'border-box',
        }}
      >
        <AppLoadingLayout
          loadingText={
            chatGPTConversationLoading
              ? t('client:floating_menu__input__running_placeholder')
              : t('common:loading')
          }
          loading={isLoadingMemo}
          size={24}
          sx={{ width: 228 }}
        >
          {currentProviderOption && clientState.status !== 'success' && (
            <AIProviderAuthCard aiProviderOption={currentProviderOption} />
          )}
          {currentProviderOption && clientState.status === 'success' && (
            <AIProviderCard aiProviderOption={currentProviderOption} />
          )}
        </AppLoadingLayout>
      </Stack>
      <Stack
        sx={{
          width: 0,
          flex: 1,
        }}
      >
        <List component={'nav'} sx={{ py: 0, pt: 1 }}>
          {AIProviderOptions.map((providerOption) => {
            return (
              <ListItemButton
                id={`max-ai__ai-provider-selector__${providerOption.value}`}
                className={`max-ai__ai-provider-selector__item ${
                  providerOption.value === currentSidebarAIProvider
                    ? 'selected'
                    : ''
                }`}
                onClick={async () => {
                  if (currentSidebarAIProvider === providerOption.value) {
                    return
                  }

                  const changeProviderFn = async (
                    providerOption: AIProviderOptionType,
                  ) => {
                    await updateSidebarSettings({
                      common: {
                        currentAIProvider: providerOption.value,
                      },
                    })
                    await switchBackgroundChatSystemAIProvider(
                      providerOption.value,
                    )
                    if (currentSidebarConversationType === 'Chat') {
                      await cleanConversation(true)
                      await createConversation('Chat')
                    }
                  }

                  if (providerOption.isThirdParty) {
                    // 如果是第三方需要弹出 confirm dialog
                    setProviderConfirmDialogState({
                      open: true,
                      confirmProviderValue: providerOption.value,
                      confirmFn: changeProviderFn,
                    })
                    return
                  }

                  changeProviderFn(providerOption)
                }}
                selected={providerOption.value === currentSidebarAIProvider}
                disabled={isLoadingMemo}
                key={providerOption.value}
                sx={{
                  pl: 1.5,
                  pr: 1,
                }}
              >
                <Stack spacing={1} alignItems={'center'} direction={'row'}>
                  <AIProviderIcon
                    aiProviderType={providerOption.value}
                    size={iconSize}
                  />
                  <Typography
                    component={'span'}
                    fontSize={'14px'}
                    fontWeight={400}
                    color={'text.primary'}
                    textAlign={'left'}
                  >
                    {t(providerOption.label as any)}
                  </Typography>
                  {providerOption.isThirdParty ? (
                    <Typography
                      component={'span'}
                      fontSize={'8px'}
                      fontWeight={500}
                      color={'text.primary'}
                      textAlign={'left'}
                      letterSpacing={'-0.16px'}
                      px={0.25}
                      borderRadius={1}
                      lineHeight={1.4}
                      ml={'4px !important'}
                      bgcolor={(t) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.08)'
                      }
                      whiteSpace={'nowrap'}
                    >
                      {t('client:provider__label__third_part' as any)}
                    </Typography>
                  ) : (
                    <AIProviderMainPartIcon />
                  )}
                </Stack>
              </ListItemButton>
            )
          })}
          <ListItemButton disabled={!closeAble} onClick={onClose}>
            <Stack
              sx={{ minHeight: '28px' }}
              width={'100%'}
              spacing={1}
              alignItems={'center'}
              direction={'row'}
              justifyContent={'end'}
            >
              {closeAble && (
                <ContextMenuIcon
                  icon={'Close'}
                  sx={{
                    fontSize: `24px`,
                  }}
                />
              )}
            </Stack>
          </ListItemButton>
        </List>
      </Stack>
    </Box>
  )
}

export default AIProviderSelectorCard
