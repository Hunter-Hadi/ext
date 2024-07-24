import { Divider } from '@mui/material'
import Stack from '@mui/material/Stack'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilCallback, useRecoilState } from 'recoil'

import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import TooltipIconButton from '@/components/TooltipIconButton'
import { useClientConversation } from '@/features/chatgpt/hooks/useClientConversation'
import SidebarUsePromptButton from '@/features/contextMenu/components/FloatingContextMenu/buttons/SidebarUsePromptButton'
import {
  ContextMenuConversationState,
  ContextMenuPinedToSidebarState,
  FloatingDropdownMenuState,
} from '@/features/contextMenu/store'
import { PinToSidebarState } from '@/features/contextMenu/store'
import { IAIResponseMessage } from '@/features/indexed_db/conversations/models/Message'
import SidebarCopyButton from '@/features/sidebar/components/SidebarChatBox/SidebarCopyButton'
import SidebarAIMessageAttachmentsDownloadButton from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageContent/SidebarAIMessageImageContent/SidebarAIMessageAttachmentsDownloadButton'
import AIMessageModelSuggestions from '@/features/sidebar/components/SidebarChatBox/sidebarMessages/SidebarAIMessage/SidebarAIMessageTools/AIMessageModelSuggestions'
import { hideChatBox } from '@/features/sidebar/utils/sidebarChatBoxHelper'
import { findSelectorParent } from '@/utils/dataHelper/elementHelper'

const SidebarAIMessageTools: FC<{
  useChatGPTAble?: boolean
  message: IAIResponseMessage
}> = (props) => {
  const { message } = props
  const { currentSidebarConversationType, currentConversationId } =
    useClientConversation()
  const [contextMenuPinedToSidebar, setContextMenuPinedToSidebar] =
    useRecoilState(ContextMenuPinedToSidebarState)
  const [pinToSidebar, setPinToSidebar] = useRecoilState(PinToSidebarState)

  const { t } = useTranslation(['common', 'client'])
  const [isCoping, setIsCoping] = useState(false)

  const messageContentType =
    message.originalMessage?.content?.contentType || 'text'
  const gmailChatBoxAiToolsRef = React.useRef<HTMLDivElement>(null)

  const handleContinueInContextMenu = useRecoilCallback(
    ({ snapshot, set }) => {
      return async () => {
        const floatingDropdownMenu = await snapshot.getPromise(
          FloatingDropdownMenuState,
        )

        // 还存在选区的情况下设置conversationId
        if (
          !floatingDropdownMenu.open &&
          floatingDropdownMenu.rootRect &&
          currentConversationId
        ) {
          set(ContextMenuConversationState, (prev) => ({
            ...prev,
            conversationId: currentConversationId,
          }))

          set(FloatingDropdownMenuState, (prev) => ({ ...prev, open: true }))
        }

        setContextMenuPinedToSidebar(false)

        setPinToSidebar({
          always: false,
          once: false,
        })
        setTimeout(() => {
          hideChatBox()
        }, 0)
      }
    },
    [currentConversationId],
  )

  const handleContinueInSidebar = () => {
    setPinToSidebar({
      always: true,
      once: false,
    })
  }

  return (
    <Stack
      direction={'row'}
      alignItems={'center'}
      spacing={0.5}
      mt={1}
      ref={gmailChatBoxAiToolsRef}
    >
      {messageContentType === 'image' && (
        <TooltipIconButton
          loading={isCoping}
          disabled={isCoping}
          title={t('common:copy_image')}
          onClick={async (event) => {
            const image = findSelectorParent(
              '.maxai-ai-message__image__content__box img',
              event.currentTarget,
            ) as HTMLImageElement
            if (!image?.src) {
              return
            }
            setIsCoping(true)
            try {
              const newImage = new Image()
              await new Promise((resolve) => {
                try {
                  newImage.src = image.src
                  newImage.crossOrigin = 'anonymous'
                  newImage.onload = () => {
                    const canvas = document.createElement('canvas')
                    canvas.width = newImage.naturalWidth
                    canvas.height = newImage.naturalHeight
                    const ctx = canvas.getContext('2d')
                    if (ctx) {
                      ctx.drawImage(newImage, 0, 0)
                      canvas.toBlob(function (blob) {
                        if (blob) {
                          const item = new ClipboardItem({ 'image/png': blob })
                          navigator.clipboard
                            .write([item])
                            .then(function () {
                              console.log('Image copied to clipboard')
                              resolve(true)
                            })
                            .catch(function (error) {
                              console.error(
                                'Error copying image to clipboard',
                                error,
                              )
                              resolve(false)
                            })
                            .finally(() => {})
                        } else {
                          resolve(false)
                        }
                      })
                    }
                  }
                  newImage.onerror = () => {
                    resolve(false)
                  }
                } catch (e) {
                  resolve(false)
                }
              })
            } catch (e) {
              console.error('Error copying image to clipboard', e)
            } finally {
              setIsCoping(false)
            }
          }}
        >
          <ContextMenuIcon
            icon={'Copy'}
            sx={{
              fontSize: '20px',
            }}
          />
        </TooltipIconButton>
      )}
      {message && (
        <SidebarAIMessageAttachmentsDownloadButton message={message} />
      )}
      {messageContentType === 'text' && <SidebarCopyButton message={message} />}
      {messageContentType === 'text' && (
        <SidebarUsePromptButton
          iconButton
          message={message}
          className={'max-ai__actions__button--use-max-ai'}
        />
      )}
      <AIMessageModelSuggestions AIMessage={message} />

      {currentSidebarConversationType === 'ContextMenu' &&
        contextMenuPinedToSidebar &&
        pinToSidebar.always && (
          <>
            <Divider orientation='vertical'></Divider>
            <TooltipIconButton
              title={t('client:floating_menu__always_unpin_to_sidebar')}
              onClick={handleContinueInContextMenu}
            >
              <ContextMenuIcon
                icon='PopupWindow'
                fill='primary'
                sx={{
                  fontSize: '20px',
                  color: 'text.primary',
                }}
              ></ContextMenuIcon>
            </TooltipIconButton>
          </>
        )}
    </Stack>
  )
}
export default SidebarAIMessageTools
