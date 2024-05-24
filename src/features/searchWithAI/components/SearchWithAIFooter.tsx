// import LoopOutlinedIcon from '@mui/icons-material/LoopOutlined'
import OpenInNewOutlined from '@mui/icons-material/OpenInNewOutlined'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { FC } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'


import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message';
import {
  ISearchWithAIProviderType,
  SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER,
} from '@/features/searchWithAI/constants'

interface IProps {
  handleAskQuestion: () => void
  aiMessage: IAIResponseMessage | null
  aiProvider: ISearchWithAIProviderType
}

const SearchWithAIFooter: FC<IProps> = ({
  handleAskQuestion,
  aiMessage,
  aiProvider,
}) => {
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
                  aiProvider,
                  aiModel: SEARCH_WITH_AI_DEFAULT_MODEL_BY_PROVIDER[aiProvider],
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
