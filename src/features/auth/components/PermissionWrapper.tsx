import React, { FC, useEffect, useRef, useState } from 'react'
import {
  IUserCurrentPlan,
  useUserInfo,
} from '@/features/auth/hooks/useUserInfo'
import { IUserRoleType } from '@/features/auth/types'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import Box, { BoxProps } from '@mui/material/Box'
import { ClickAwayListener } from '@mui/material'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { v4 as uuidV4 } from 'uuid'
import {
  APP_USE_CHAT_GPT_HOST,
  CHROME_EXTENSION_HOMEPAGE_URL,
} from '@/constants'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import LazyLoadImage from '@/components/LazyloadImage'

type PermissionWrapperCardSceneType =
  | 'CUSTOM_PROMPT'
  | 'CUSTOM_PROMPT_GROUP'
  | 'GMAIL_CTA_BUTTON'
  | 'GMAIL_CONTEXT_MENU'
  | 'AI_RESPONSE_LANGUAGE'
  | 'CHATGPT_STABLE_MODE'
  | 'PDF'

export type PermissionWrapperCardType = {
  imageUrl?: string
  videoUrl?: string
  title: React.ReactNode
  description: React.ReactNode
  ctaButtonText?: React.ReactNode
  ctaButtonLink?: string
  ctaButtonOnClick?: (event: React.MouseEvent) => void
}

interface PermissionWrapperProps {
  sceneType: PermissionWrapperCardSceneType
  permissions: IUserRoleType[]
  onPermission?: (
    currentPlan: IUserCurrentPlan,
    cardSettings: PermissionWrapperCardType,
    event: any,
  ) => Promise<{
    success: boolean
    cardSettings?: Partial<PermissionWrapperCardType>
  }>
  children: React.ReactNode
  TooltipProps?: Omit<TextOnlyTooltipProps, 'title' | 'children'>
  BoxProps?: BoxProps
}

export const PERMISSION_CARD_SETTINGS_TEMPLATE: {
  [key in PermissionWrapperCardSceneType]: PermissionWrapperCardType
} = {
  // 自定义prompt
  CUSTOM_PROMPT: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/custom-prompt.png`,
    title: 'Upgrade to add unlimited custom prompts',
    description:
      'Use your own prompts to speed up repetitive tasks as you work.',
    ctaButtonText: 'Upgrade to Pro',
  },
  // 自定义prompt
  CUSTOM_PROMPT_GROUP: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/custom-prompt-group.png`,
    title: 'Upgrade to add unlimited custom prompt groups',
    description:
      'Organize your prompts for efficient use with custom prompt groups.',
    ctaButtonText: 'Upgrade to Pro',
  },
  // Gmail cta button
  GMAIL_CTA_BUTTON: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/gmail-cta-button.png`,
    // 新邮件
    title: 'Upgrade for one-click email drafts',
    //邮件回复
    // title: 'Upgrade for one-click email replies'
    // 新邮件
    description: 'Let AI generate entire email drafts for you in seconds.',
    // 邮件回复
    // description:
    // 'Let AI generate entire email replies for you in seconds.',
  },
  // Gmail context menu
  GMAIL_CONTEXT_MENU: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/gmail-context-menu.png`,
    title: 'Upgrade to perfect your draft in one click',
    description:
      'Improve writing, fix spelling & grammar, or change tone instantly with AI.',
  },
  // AI response language
  AI_RESPONSE_LANGUAGE: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/ai-response-language.png`,
    title: 'Upgrade to change AI response language',
    description: 'Set AI to always reply in your chosen language.',
  },
  // ChatGPT Stable mode
  CHATGPT_STABLE_MODE: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/chatgpt-stable-mode.png`,
    title: 'Upgrade to personalize ChatGPT stable mode',
    description: 'Set how long ChatGPT stable mode stays on after activation.',
  },
  // PDF
  PDF: {
    imageUrl: `${CHROME_EXTENSION_HOMEPAGE_URL}/assets/chrome-extension/upgrade/pdf.png`,
    title: 'Upgrade to elevate your PDF experience with AI',
    description:
      'Use AI to summarize, explain, translate, ask questions, and save time.',
  },
}

export const getPermissionCardSettings = (
  sceneType: PermissionWrapperCardSceneType,
) => {
  return {
    ctaButtonText: 'Upgrade to Pro',
    ctaButtonLink: `${APP_USE_CHAT_GPT_HOST}/pricing`,
    ...PERMISSION_CARD_SETTINGS_TEMPLATE[sceneType],
  }
}

const PermissionWrapper: FC<PermissionWrapperProps> = (props) => {
  const {
    sceneType = 'PROMPT',
    permissions,
    onPermission,
    BoxProps,
    TooltipProps,
    children,
  } = props
  const [permissionCard, setPermissionCard] =
    useState<PermissionWrapperCardType>(() => {
      return getPermissionCardSettings(
        sceneType as PermissionWrapperCardSceneType,
      )
    })
  const { currentUserPlan } = useUserInfo()
  console.log('currentUserPlan', currentUserPlan.name)
  const [open, setOpen] = useState(false)
  const idRef = useRef(uuidV4())
  useEffect(() => {
    const listener = (event: any) => {
      if (event.detail.id === idRef.current) return
      setOpen(event.detail.open)
    }
    window.addEventListener('maxAIPermissionWrapperCustomEvent', listener)
    return () => {
      window.removeEventListener('maxAIPermissionWrapperCustomEvent', listener)
    }
  }, [])
  if (permissions.find((permission) => permission === currentUserPlan.name)) {
    return <>{children}</>
  }
  return (
    <TextOnlyTooltip
      arrow
      open={open}
      PopperProps={{
        sx: {
          '& > div': {
            maxWidth: 320,
            p: 1,
          },
        },
      }}
      title={
        <ClickAwayListener
          mouseEvent={'onMouseDown'}
          onClickAway={() => {
            setOpen(false)
          }}
        >
          <Stack spacing={1} component="div">
            {permissionCard.videoUrl && (
              <YoutubePlayerBox
                borderRadius={4}
                youtubeLink={permissionCard.videoUrl}
              />
            )}
            {permissionCard.imageUrl && (
              <Box
                sx={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  '& img': {
                    width: '100%',
                    height: 'auto',
                  },
                }}
              >
                <LazyLoadImage
                  skeletonHeight={140}
                  src={permissionCard.imageUrl}
                  alt={`${permissionCard.title} img`}
                />
              </Box>
            )}
            <Typography
              fontSize={'14px'}
              fontWeight={600}
              textAlign={'left'}
              color={'rgba(255,255,255,.87)'}
            >
              {permissionCard.title}
            </Typography>
            <Typography
              fontSize={'12px'}
              fontWeight={400}
              textAlign={'left'}
              color={'rgba(255,255,255,.87)'}
            >
              {permissionCard.description}
            </Typography>
            {permissionCard.ctaButtonText && (
              <Link
                target={'_blank'}
                href={permissionCard.ctaButtonLink}
                onClick={(event) => {
                  event.preventDefault()
                  window.open(permissionCard.ctaButtonLink, '_blank')
                  permissionCard.ctaButtonOnClick?.(event)
                  setOpen(false)
                }}
              >
                <Button fullWidth variant={'contained'}>
                  {permissionCard.ctaButtonText}
                </Button>
              </Link>
            )}
          </Stack>
        </ClickAwayListener>
      }
      {...TooltipProps}
    >
      <Box {...BoxProps}>
        <Box>
          {
            React.Children.map(children, (child) => {
              // modify child props
              if (React.isValidElement(child)) {
                const newProps = {
                  ...child.props,
                  ...(child.props.onClick && {
                    onClick: async (event: any, ...args: any[]) => {
                      let isAuth = false
                      event?.stopPropagation?.()
                      event?.preventDefault?.()
                      if (onPermission) {
                        const { success, cardSettings } = await onPermission(
                          currentUserPlan,
                          permissionCard,
                          [event, ...args],
                        )
                        setPermissionCard({
                          ...permissionCard,
                          ...cardSettings,
                        })
                        isAuth = success
                      }
                      // custom event
                      // 关闭其他的
                      const customEvent = new CustomEvent(
                        'maxAIPermissionWrapperCustomEvent',
                        {
                          detail: {
                            id: idRef.current,
                            open: false,
                          },
                        },
                      )
                      window.dispatchEvent(customEvent)
                      setOpen(!isAuth)
                      if (isAuth) {
                        child.props?.onClick?.(event, ...args)
                      }
                    },
                  }),
                  ...(child.props.onChange && {
                    onChange: async (event: any, ...args: any[]) => {
                      let isAuth = false
                      event?.stopPropagation?.()
                      event?.preventDefault?.()
                      if (onPermission) {
                        const { success, cardSettings } = await onPermission(
                          currentUserPlan,
                          permissionCard,
                          [event, ...args],
                        )
                        setPermissionCard({
                          ...permissionCard,
                          ...cardSettings,
                        })
                        isAuth = success
                      }
                      // custom event
                      // 关闭其他的
                      const customEvent = new CustomEvent(
                        'maxAIPermissionWrapperCustomEvent',
                        {
                          detail: {
                            id: idRef.current,
                            open: false,
                          },
                        },
                      )
                      window.dispatchEvent(customEvent)
                      setOpen(!isAuth)
                      if (isAuth) {
                        child.props?.onChange?.(event, ...args)
                      }
                    },
                  }),
                }
                return React.cloneElement(child, newProps)
              }
              return child
            }) as any
          }
        </Box>
      </Box>
    </TextOnlyTooltip>
  )
}
export default PermissionWrapper
