import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {useRecoilState} from "recoil";

import ShortcutActionsEditor from '@/features/shortcuts/components/ShortcutsActionsEditor'
import useShortcutEditorActions from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActions'
import { useSettingPromptsContext } from '@/pages/settings/pages/prompts/components/SettingPromptsEditFormModal/context'
import {SettingPromptsEditButtonKeyAtom} from "@/pages/settings/pages/prompts/store";

const PromptPanel = () => {
  const { t } = useTranslation(['settings', 'common'])

  const { editNode, selectedIcon } = useSettingPromptsContext()
  const {
    editHTML,
    updateEditHTML,
    enabledAIResponseLanguage,
    toggleAIResponseLanguage,
  } = useShortcutEditorActions()

  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )

  return (
    <Stack spacing={2}>
      {editNode.data.type === 'shortcuts' && (
        <Stack spacing={1} pb={1}>
          <Stack direction={'row'} alignItems="center">
            <Typography variant={'body1'}>
              {`${t(
                'settings:feature_card__prompts__edit_prompt__field_template__title',
              )} `}
              <span style={{ color: 'red' }}>*</span>
            </Typography>
          </Stack>
          <ShortcutActionsEditor
            disableCustomVariables={settingPromptsEditButtonKey === 'sidebarSummaryButton'}
            placeholder={t(
              'settings:feature_card__prompts__edit_prompt__field_template__placeholder',
            )}
          />
        </Stack>
      )}
    </Stack>
  )
}

export default PromptPanel
