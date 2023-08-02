import React, { FC, useMemo } from 'react'
import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderOptions'
import Typography from '@mui/material/Typography'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderIcon'
import AIProviderAuthCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderAuthCard'
import AIProviderCard from '@/features/chatgpt/components/AIProviderSelectorCard/AIProviderCard'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import AppLoadingLayout from '@/components/AppLoadingLayout'
import { useTranslation } from 'react-i18next'

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
    provider,
    updateChatGPTProvider,
    loading: switchProviderLoading,
  } = useChatGPTProvider()
  const isLoadingMemo = useMemo(() => {
    return chatGPTConversationLoading || switchProviderLoading
  }, [chatGPTConversationLoading, switchProviderLoading])
  const currentProviderOption = useMemo(() => {
    return AIProviderOptions.find(
      (aiProviderOption) => aiProviderOption.value === provider,
    )
  }, [provider])
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
          width: 248,
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
          sx={{ width: 248 }}
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
                onClick={async () => {
                  if (providerOption.value !== provider) {
                    await updateChatGPTProvider(providerOption.value)
                  }
                }}
                selected={providerOption.value === provider}
                disabled={isLoadingMemo}
                key={providerOption.value}
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
