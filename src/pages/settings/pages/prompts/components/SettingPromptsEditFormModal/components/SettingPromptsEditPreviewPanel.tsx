import StopOutlinedIcon from '@mui/icons-material/StopOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { Theme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import React, { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import DevContent from '@/components/DevContent'
import useClientChat from '@/features/chatgpt/hooks/useClientChat'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import useClientConversationListener from '@/features/chatgpt/hooks/useClientConversationListener'
import useSmoothConversationLoading from '@/features/chatgpt/hooks/useSmoothConversationLoading'
import ActionSetVariablesModal from '@/features/shortcuts/components/ActionSetVariablesModal'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { htmlToTemplate } from '@/features/shortcuts/components/ShortcutsActionsEditor/utils'
import SidebarAIAdvanced from '@/features/sidebar/components/SidebarChatBox/SidebarAIAdvanced'
import SidebarChatBoxMessageListContainer from '@/features/sidebar/components/SidebarChatBox/SidebarChatBoxMessageListContainer'
import DevConsole from '@/features/sidebar/components/SidebarTabs/DevConsole'
import { useGeneratePreviewActions } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/hooks/useGenerateActions'
import { useSettingPromptsEditContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/hooks/useSettingPromptsEditContext'
import { getPreviewEditorSystemVariables } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/utils'
import OneShotCommunicator from '@/utils/OneShotCommunicator'

const PreviewPanel = () => {
  const { t } = useTranslation(['client', 'prompt_editor'])
  const { editNode } = useSettingPromptsEditContext()
  const generatePreviewActions = useGeneratePreviewActions()

  const title = editNode?.text

  const { editHTML } = useShortcutEditorActions()

  const template = useMemo(() => htmlToTemplate(editHTML), [editHTML])

  const actions = useMemo(
    () => generatePreviewActions(),
    [generatePreviewActions],
  )

  const config = useMemo(() => {
    // 有些变量是run shortcuts时会覆盖，具体在useShortCutsParameters里
    // 这里取出预设的一些变量，设置并覆盖
    const overrideVariables = getPreviewEditorSystemVariables(false).filter(
      (item) => item.defaultValue,
    )

    const setModalConfig = actions.find(
      (item) => item.type === 'SET_VARIABLES_MODAL',
    )?.parameters.SetVariablesModalConfig

    const configActions = setModalConfig?.actions || []

    overrideVariables.forEach((item) => {
      configActions.push({
        type: 'SET_VARIABLE',
        parameters: {
          Variable: {
            key: item.VariableName,
            value: item.defaultValue,
            overwrite: true,
            isBuiltIn: true,
            label: item.label,
          },
        },
      })
    })

    return {
      ...setModalConfig,
      actions: configActions,
      template,
      modelKey: 'PromptPreview',
    }
  }, [actions, template])

  useEffect(() => {
    // 为了能让ActionSetVariablesModal组件能正常执行
    // ActionSetVariablesModal组件运行的时候是从config里的参数执行
    // 表单参数是可以从props传递进去
    OneShotCommunicator.send('SetVariablesModal', {
      task: 'open',
      config,
    })
  }, [config])

  const { stopGenerate } = useClientChat()
  const {
    currentConversationId,
    clientWritingMessage,
    clientConversationMessages,
  } = useClientConversation()
  const { smoothConversationLoading: loading } =
    useSmoothConversationLoading(500)
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
        // 这里先用display去隐藏掉preview use prompt的功能
        ' .max-ai__actions__button--use-max-ai': {
          display: 'none',
        },
      }}
    >
      <DevContent>
        <DevConsole isSidebar sx={{ right: 0 }} />
        <Typography id={'chat-panel'} color={'text.primary'} fontSize={'16px'}>
          {currentConversationId}
        </Typography>
      </DevContent>

      <Typography
        fontSize="16px"
        textAlign="center"
        sx={{
          padding: '16px 12px',
          color: (t: Theme) =>
            t.palette.mode === 'dark' ? '#fff' : 'rgba(0, 0, 0, 0.38)',
        }}
      >
        {t('prompt_editor:preview_panel__title')}
      </Typography>

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
                onClick={stopGenerate}
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
            {...config}
            modelKey="PromptPreview"
            title={title}
            template={template}
            disabled={!template}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}

export default PreviewPanel
