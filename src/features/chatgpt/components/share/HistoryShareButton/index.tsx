import React, { FC } from 'react'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import { useTranslation } from 'react-i18next'
import TooltipIconButton from '@/components/TooltipIconButton'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { clientGetConversation } from '@/features/chatgpt/hooks/useInitClientConversationMap'
import { formatMessagesToLiteHistory } from '@/features/sidebar/utils/chatMessagesHelper'
import dayjs from 'dayjs'

const HistoryShareButton: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const {
    currentSidebarConversationId,
    currentSidebarConversationMessages,
  } = useSidebarSettings()
  if (
    currentSidebarConversationMessages.length === 0 ||
    !currentSidebarConversationId
  ) {
    return null
  }
  return (
    <TooltipIconButton
      title={t('client:sidebar__share__share_button__tooltip')}
      onClick={async () => {
        const conversation = await clientGetConversation(
          currentSidebarConversationId,
        )
        if (conversation?.title) {
          const needDownloadText = await formatMessagesToLiteHistory(
            conversation,
          )
          const blob = new Blob([needDownloadText], {
            type: 'text/plain;charset=utf-8',
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${conversation.title}_${dayjs().format(
            'YYYY_MM_DD_HH:mm',
          )}.txt`
          a.click()
          URL.revokeObjectURL(url)
        }
      }}
    >
      <ContextMenuIcon
        icon={'FileDownload'}
        sx={{
          fontSize: '20px',
          color: 'text.secondary',
        }}
      />
    </TooltipIconButton>
  )
}
export default HistoryShareButton
