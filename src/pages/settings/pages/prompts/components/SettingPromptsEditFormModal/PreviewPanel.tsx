import StopOutlinedIcon from "@mui/icons-material/StopOutlined";
import Box from '@mui/material/Box'
import Button from "@mui/material/Button";
import Stack from '@mui/material/Stack'
import {Theme} from "@mui/material/styles";
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useClientConversationListener from "@/features/chatgpt/hooks/useClientConversationListener";
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { htmlToTemplate } from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import SidebarAIAdvanced from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced'
import SidebarChatBoxMessageListContainer from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageListContainer'
import { useSettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/context'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

const PreviewPanel = () => {
  const { t } = useTranslation(['settings', 'common', 'client'])
  const { editNode } = useSettingPromptsContext()

  const title = editNode?.text

  const { generateActions, editHTML, variables, enabledAIResponseLanguage } =
    useShortcutEditorActions()

  const template = useMemo(() => htmlToTemplate(editHTML), [editHTML])

  const actions = useMemo(
    () => generateActions(editNode?.text),
    [editNode?.text, template],
  )

  const config = actions.find((item) => item.type === 'SET_VARIABLES_MODAL')
    ?.parameters.SetVariablesModalConfig

  useEffect(() => {
    OneShotCommunicator.send('SetVariablesModal', {
      task: 'open',
      config: { ...config, modelKey: 'PromptPreview' },
    })
  }, [config])

  const {
    currentConversationId,
    clientWritingMessage,
    clientConversationMessages,
  } = useClientConversation()
  const { smoothConversationLoading: loading } = useSmoothConversationLoading(500)
  useClientConversationListener()

  const shortcutsActionBtnSxMemo = useMemo(() => {
    return {
      borderRadius: 2,
      borderColor: 'primary.main',
      color: (t: Theme) => {
        return t.palette.mode === 'dark' ? '#fff' : 'primary.main'
      },
      '&:hover': {
        color: 'customColor.hoverColor',
        borderColor: 'primary.main',
      },
    }
  }, [])

  return (
    <Stack
      id={'maxAISidebarChatBox'}
      position={'relative'}
      sx={{
        height: 0,
        flex: 1,
        '& .MuiButton-root': {
          textTransform: 'none',
        },
      }}
    >
      {currentConversationId && clientConversationMessages.length > 0 ? (
        <SidebarChatBoxMessageListContainer
          conversationId={currentConversationId}
          loading={loading}
          messages={clientConversationMessages}
          writingMessage={clientWritingMessage.writingMessage}
          sx={{
            textAlign: 'left',
          }}
        />
      ) : null}

      <Stack
        className={'use-chat-gpt-ai__chat-box__input-box'}
        position={'relative'}
        mt={'auto'}
        justifyContent={'end'}
        alignItems={'center'}
        minHeight={170}
        spacing={1}
        flexShrink={0}
        // bgcolor={'#fff'}
      >
        <Stack
          p={1}
          width={'100%'}
          alignItems={'center'}
          justifyContent={'center'}
        >
          <Box
            sx={{ width: '100%' }}
            component={'div'}
            display={'flex'}
            width={0}
            flex={1}
            alignItems={'center'}
            justifyContent={'center'}
            gap={1}
            mb={1}
            position={'relative'}
          >
            <SidebarAIAdvanced
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
              }}
            />

            {loading && (
              <Button
                sx={shortcutsActionBtnSxMemo}
                disableElevation
                variant={'normalOutlined'}
                startIcon={<StopOutlinedIcon />}
                onClick={() => {

                }}
                data-testid="sidebar_actions__stop_generating"
              >
                {t('client:sidebar__button__stop_generating')}
              </Button>
            )}
          </Box>
          <ActionSetVariablesModal
            show
            showModelSelector
            showCloseButton={false}
            isSaveLastRunShortcuts={false}
            modelKey="PromptPreview"
            {...config}
            title={title}
            template={template}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

export default PreviewPanel
