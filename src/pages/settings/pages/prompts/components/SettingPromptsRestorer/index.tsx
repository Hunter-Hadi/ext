import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Button from '@mui/material/Button'
import React, { type FC, memo, useState } from "react"
import { useTranslation } from 'react-i18next'

import { ChromeExtensionDBStorageSnapshot } from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorageSnapshot'

import SettingPromptsRestoreDialog from './SettingPromptsRestoreDialog'

const SettingPromptsRestorer: FC<{
    disabled?: boolean;
    onRestore: (snapshot: ChromeExtensionDBStorageSnapshot) => void
    onClose?: () => void
}> = ({ disabled, onRestore }) => {
    const { t } = useTranslation(['settings'])
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
    return <>
        <Button
            disableElevation
            variant={'outlined'}
            disabled={disabled}
            onClick={() => setRestoreDialogOpen(true)}
            startIcon={<RestartAltIcon />}
            sx={{ borderRadius: '8px', marginLeft: 'auto!important' }}
        >
            {t('settings:feature_card__prompts__restore_button')}
        </Button>
        {restoreDialogOpen && (
            <SettingPromptsRestoreDialog
                onRestore={onRestore}
                onClose={() => {
                    setRestoreDialogOpen(false)
                }}
            />
        )}
    </>
}

export default memo(SettingPromptsRestorer)