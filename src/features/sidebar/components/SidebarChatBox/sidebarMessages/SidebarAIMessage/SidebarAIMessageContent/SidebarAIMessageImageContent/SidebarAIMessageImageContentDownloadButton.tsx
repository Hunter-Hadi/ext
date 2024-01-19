import { SxProps } from '@mui/material/styles'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'

const SidebarAIMessageImageContentDownloadButton: FC<{
  downloadUrl: string
  sx?: SxProps
}> = (props) => {
  const { t } = useTranslation(['common', 'client'])
  const { downloadUrl, sx } = props
  return (
    <TooltipIconButton
      sx={{
        ...sx,
      }}
      title={t('common:download_image')}
      onClick={() => {
        const a = document.createElement('a')
        a.href = downloadUrl
        a.download = 'download'
        a.click()
        a.remove()
      }}
    >
      <ContextMenuIcon icon={'FileDownload'} sx={{ fontSize: '20px' }} />
    </TooltipIconButton>
  )
}

export default SidebarAIMessageImageContentDownloadButton
