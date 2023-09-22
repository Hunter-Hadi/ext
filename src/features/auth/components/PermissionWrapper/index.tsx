import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import {
  IUserCurrentPlan,
  useUserInfo,
} from '@/features/auth/hooks/useUserInfo'
import { IUserRoleType } from '@/features/auth/types'
import TextOnlyTooltip, {
  TextOnlyTooltipProps,
} from '@/components/TextOnlyTooltip'
import Box, { BoxProps } from '@mui/material/Box'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { v4 as uuidV4 } from 'uuid'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import YoutubePlayerBox from '@/components/YoutubePlayerBox'
import LazyLoadImage from '@/components/LazyLoadImage'

import {
  PermissionWrapperCardSceneType,
  PermissionWrapperCardType,
} from '@/features/auth/components/PermissionWrapper/types'
import { authEmitPricingHooksLog } from '@/features/auth/utils/log'
import { usePermissionCard } from '@/features/auth'

export interface PermissionWrapperProps {
  sceneType: PermissionWrapperCardSceneType
  allowedRoles: IUserRoleType[]
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

const PermissionWrapper: FC<PermissionWrapperProps> = (props) => {
  const {
    sceneType,
    allowedRoles,
    onPermission,
    BoxProps,
    TooltipProps,
    children,
  } = props
  const permissionCard = usePermissionCard(sceneType)
  const [modifyPermissionCard, setModifyPermissionCard] = useState<
    PermissionWrapperCardType | undefined
  >(undefined)
  const memoizedPermissionCard = useMemo(() => {
    if (modifyPermissionCard) {
      return modifyPermissionCard
    }
    return permissionCard
  }, [permissionCard, modifyPermissionCard])
  const { currentUserPlan } = useUserInfo()
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
  // 通用的权限判断逻辑
  const hasPermissionMemo = useMemo(() => {
    // 判断角色
    if (
      allowedRoles.find((permission) => permission === currentUserPlan.name)
    ) {
      return true
    }
    // 判断是否为新用户
    if (
      allowedRoles.find((permission) => permission === 'new_user') &&
      currentUserPlan?.isNewUser
    ) {
      return true
    }
    return false
  }, [currentUserPlan, allowedRoles])

  if (hasPermissionMemo) {
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
            {memoizedPermissionCard.videoUrl && (
              <YoutubePlayerBox
                borderRadius={4}
                cover={memoizedPermissionCard.imageUrl}
                youtubeLink={memoizedPermissionCard.videoUrl}
              />
            )}
            {!memoizedPermissionCard.videoUrl &&
              memoizedPermissionCard.imageUrl && (
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
                    height={140}
                    src={memoizedPermissionCard.imageUrl}
                    alt={`${memoizedPermissionCard.title} img`}
                  />
                </Box>
              )}
            <Typography
              fontSize={'14px'}
              fontWeight={600}
              textAlign={'left'}
              color={'rgba(255,255,255,.87)'}
            >
              {memoizedPermissionCard.title}
            </Typography>
            <Typography
              fontSize={'12px'}
              fontWeight={400}
              textAlign={'left'}
              color={'rgba(255,255,255,.87)'}
            >
              {memoizedPermissionCard.description}
            </Typography>
            {memoizedPermissionCard.ctaButtonText && (
              <Link
                target={'_blank'}
                href={memoizedPermissionCard.ctaButtonLink}
                onClick={(event) => {
                  event.preventDefault()
                  window.open(memoizedPermissionCard.ctaButtonLink, '_blank')
                  memoizedPermissionCard.ctaButtonOnClick?.(event)
                  setOpen(false)
                  authEmitPricingHooksLog('click', permissionCard.sceneType)
                }}
              >
                <Button fullWidth variant={'contained'}>
                  {memoizedPermissionCard.ctaButtonText}
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
                        setModifyPermissionCard({
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
                      } else {
                        authEmitPricingHooksLog(
                          'show',
                          permissionCard.sceneType,
                        )
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
                        setModifyPermissionCard({
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
                      } else {
                        authEmitPricingHooksLog(
                          'show',
                          permissionCard.sceneType,
                        )
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
