// import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined'
import { FC } from 'react'
import React from 'react'
import { IAIResponseMessage } from '@/features/chatgpt/types'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import { useTranslation } from 'react-i18next'
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined'

interface IProps {
  handleAskQuestion: () => void
  aiMessage: IAIResponseMessage | null
}

const SearchWithAIFooter: FC<IProps> = ({ handleAskQuestion, aiMessage }) => {
  const { t } = useTranslation(['client', 'common'])
  return (
    <Stack p={2} spacing={1} alignItems="flex-start">
      {aiMessage && (
        <Button
          variant="normalOutlined"
          endIcon={<OpenInNewOutlined />}
          onClick={async () => {
            window.dispatchEvent(
              new CustomEvent('MaxAIContinueSearchWithAI', {
                detail: {
                  aiMessage,
                },
              }),
            )
          }}
        >
          {t('client:sidebar__search_with_ai__continue_chat__title')}
        </Button>
      )}
    </Stack>
  )

  // if (!currentProvider || !conversationLink) {
  //   return null
  // }

  // const handleOpenChatLink = () => {
  //   chromeExtensionClientOpenPage({
  //     url: conversationLink,
  //   })
  // }

  // return (
  //   <Stack p={2} spacing={1} alignItems="flex-start">
  //     <Button
  //       variant="normalOutlined"
  //       endIcon={<LaunchOutlinedIcon />}
  //       onClick={handleOpenChatLink}
  //     >
  //       Continue in {AI_PROVIDER_NAME_MAP[currentProvider]}
  //     </Button>
  //     {/* <Button
  //       variant="normalOutlined"
  //       endIcon={<LoopOutlinedIcon />}
  //       onClick={handleAskQuestion}
  //     >
  //       Ask again
  //     </Button> */}
  //   </Stack>
}

export default SearchWithAIFooter
