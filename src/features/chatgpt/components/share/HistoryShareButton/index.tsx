import dayjs from 'dayjs'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { clientGetConversation } from '@/features/chatgpt/utils/chatConversationUtils'
import useSidebarSettings from '@/features/sidebar/hooks/useSidebarSettings'
import { formatMessagesToLiteHistory } from '@/features/sidebar/utils/chatMessagesHelper'

const HistoryShareButton: FC<{
  needSystemOrThirdMessage?: boolean
}> = (props) => {
  const { needSystemOrThirdMessage = false } = props
  const { t } = useTranslation(['common', 'client'])
  const { currentSidebarConversationId, currentSidebarConversationMessages } =
    useSidebarSettings()
  // 有效的消息
  const validMessage = currentSidebarConversationMessages.filter((item) => {
    if (needSystemOrThirdMessage) {
      return true
    }
    return item.type !== 'system' && item.type !== 'third'
  })
  if (validMessage.length === 0 || !currentSidebarConversationId) {
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
            needSystemOrThirdMessage,
          )
          const blob = new Blob([needDownloadText], {
            type: 'text/plain;charset=utf-8',
          })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `MaxAI_Chat_${dayjs().format('YYYY_MM_DD_HH:mm')}.txt`
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
