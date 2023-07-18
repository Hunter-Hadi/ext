import React, { FC, useMemo } from 'react'
import Box from '@mui/material/Box'
import { SxProps } from '@mui/material/styles'
import Stack from '@mui/material/Stack'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import AIProviderOptions from '@/features/chatgpt/components/AIProviderSelector/AIProviderOptions'
import Typography from '@mui/material/Typography'
import { useRecoilValue } from 'recoil'
import { ChatGPTConversationState } from '@/features/sidebar'
import { ChatGPTClientState } from '@/features/chatgpt/store'
import useChatGPTProvider from '@/features/chatgpt/hooks/useChatGPTProvider'
import AIProviderIcon from '@/features/chatgpt/components/AIProviderSelector/AIProviderIcon'
import AIProviderAuthCard from '@/features/chatgpt/components/AIProviderSelector/AIProviderAuthCard'
import Index from '@/features/chatgpt/components/AIProviderSelector/AIProviderCard'

interface AIProviderSelectorProps {
  sx?: SxProps
  iconSize?: number
}
const AIProviderSelector: FC<AIProviderSelectorProps> = (props) => {
  const { sx, iconSize = 20 } = props
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
          width: 254,
          flexShrink: 0,
          borderRight: '1px solid #EBEBEB',
          alignItems: 'stretch',
        }}
      >
        {currentProviderOption && clientState.status !== 'success' && (
          <AIProviderAuthCard aiProviderOption={currentProviderOption} />
        )}
        {currentProviderOption && clientState.status === 'success' && (
          <Index aiProviderOption={currentProviderOption} />
        )}
      </Stack>
      <Stack
        sx={{
          width: 0,
          flex: 1,
        }}
      >
        <List component={'nav'} sx={{ py: 0 }}>
          {AIProviderOptions.map((providerOption) => {
            return (
              <ListItemButton
                onClick={async () => {
                  await updateChatGPTProvider(providerOption.value)
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
                    {providerOption.label}
                  </Typography>
                </Stack>
              </ListItemButton>
            )
          })}
        </List>
      </Stack>
    </Box>
  )
}
export default AIProviderSelector
