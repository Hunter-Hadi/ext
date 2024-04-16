import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem, { listItemClasses } from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import dayjs from 'dayjs'
import startCase from 'lodash-es/startCase'
import React from 'react'
import { useTranslation } from 'react-i18next'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { APP_USE_CHAT_GPT_HOST } from '@/constants'
import { useUserInfo } from '@/features/auth/hooks/useUserInfo'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { numberWithCommas } from '@/utils/dataHelper/numberHelper'

// 100000以上表示无限，前端不用显示具体的数; 这个值是后端定的
const IS_UNLIMITED_FLAG = 100000

// 用户 quota 使用量 卡片
const UserQuotaUsageQueriesCard = () => {
  const { t } = useTranslation()
  const { userQuotaUsage, currentUserPlan, syncUserQuotaUsageInfo } =
    useUserInfo()

  // 只在第一次加载时, 同步用户的 quota 使用量信息
  useEffectOnce(() => {
    syncUserQuotaUsageInfo()
  })

  return (
    <Box>
      <List
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgb(32, 33, 36)'
              : 'rgb(255,255,255)',
          p: '0 !important',
          borderRadius: '4px',
          border: (t) =>
            t.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
          [`& .${listItemClasses.root}`]: {
            px: 3,
            py: 1,
          },
        }}
      >
        <ListItem
          sx={{
            py: '16px !important',
          }}
        >
          <ListItemText
            primary={`${t('quota_usage_card:role_label', {
              ROLE: startCase(currentUserPlan.name),
            })}`}
          />
          <Button
            component={'a'}
            target={'_blank'}
            href={`${APP_USE_CHAT_GPT_HOST}/pricing`}
            variant={'contained'}
            sx={{
              height: 44,
            }}
          >
            {t('common:upgrade')}
          </Button>
        </ListItem>
        <Divider />
        <ListItem
          sx={{
            bgcolor: 'customColor.secondaryBackground',
            color: 'text.secondary',
          }}
        >
          <ListItemText primary={t('quota_usage_card:queries')} />

          <ListItemText
            sx={{
              textAlign: 'right',
            }}
            primary={
              <Box component={'span'}>
                <TextOnlyTooltip
                  placement={'top'}
                  title={dayjs(userQuotaUsage.updateAt).format(
                    'YYYY-MM-DD HH:mm:ss',
                  )}
                >
                  <span>
                    {t('quota_usage_card:reset_on_date', {
                      DATE: dayjs(userQuotaUsage.updateAt).format(
                        'MMM D, YYYY',
                      ),
                    })}
                  </span>
                </TextOnlyTooltip>
              </Box>
            }
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary={t('quota_usage_card:category__fast_text')}
            secondary={'GPT-3.5 & Claude-3-haiku & Gemini-Pro'}
          />

          <ListItemText
            sx={{
              textAlign: 'right',
            }}
            primary={
              userQuotaUsage.fastText > IS_UNLIMITED_FLAG
                ? t('common:unlimited')
                : numberWithCommas(userQuotaUsage.fastText, 0)
            }
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary={t('quota_usage_card:category__advanced_text')}
            secondary={'GPT-4 & Claude-3-opus/sonnet'}
          />

          <ListItemText
            sx={{
              textAlign: 'right',
            }}
            primary={
              userQuotaUsage.advancedText > IS_UNLIMITED_FLAG
                ? t('common:unlimited')
                : numberWithCommas(userQuotaUsage.advancedText, 0)
            }
          />
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary={t('quota_usage_card:category__image')}
            secondary={'DALL·E 3'}
          />

          <ListItemText
            sx={{
              textAlign: 'right',
            }}
            primary={
              userQuotaUsage.imageGenerate > IS_UNLIMITED_FLAG
                ? t('common:unlimited')
                : numberWithCommas(userQuotaUsage.imageGenerate, 0)
            }
          />
        </ListItem>
      </List>
    </Box>
  )
}

export default UserQuotaUsageQueriesCard
