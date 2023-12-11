import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL } from '@/features/common/constants'
import PageHelpCard from '@/pages/settings/components/pageHelp/PageHelpCard'

const OpenaiAPIKeyHelp: FC<{
  defaultOpen?: boolean
}> = ({ defaultOpen = false }) => {
  const { t } = useTranslation(['settings'])
  return (
    <Stack>
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t('settings:feature_card__openai_api_key__help__obtain__title')}
        listType={'number'}
        list={[
          <>
            {t('settings:feature_card__openai_api_key__help__obtain__item1__1')}
            <Link
              target={'_blank'}
              href={'https://platform.openai.com/signup'}
              rel={'noopener noreferrer nofollow'}
            >
              {t(
                'settings:feature_card__openai_api_key__help__obtain__item1__2',
              )}
            </Link>

            {t('settings:feature_card__openai_api_key__help__obtain__item1__3')}
          </>,
          <>
            {t('settings:feature_card__openai_api_key__help__obtain__item2__1')}
            <Tooltip
              PopperProps={{
                sx: {
                  '& > div': {
                    backgroundColor: 'transparent',
                    maxWidth: 'none',
                  },
                },
                style: {},
              }}
              title={
                <Stack
                  width={500}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 4,
                    borderRadius: '4px',
                  }}
                >
                  <img
                    src={`${MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL}/assets/chrome-extension/open-key-create.png`}
                    alt={'open-key-create'}
                    width={'460'}
                    height={'auto'}
                  />
                </Stack>
              }
            >
              <Link
                fontSize={14}
                target={'_blank'}
                rel={`noreferrer noopener nofollow`}
                href={'https://platform.openai.com/account/api-keys'}
              >
                {t(
                  'settings:feature_card__openai_api_key__help__obtain__item2__2',
                )}
              </Link>
            </Tooltip>
          </>,
          t('settings:feature_card__openai_api_key__help__obtain__item3'),
        ]}
      />
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t(
          'settings:feature_card__openai_api_key__discover_active_model__title',
        )}
        listType={'number'}
        list={[
          <>
            {t(
              'settings:feature_card__openai_api_key__help__discover_active_model__item1__1',
            )}
            <Tooltip
              PopperProps={{
                sx: {
                  '& > div': {
                    backgroundColor: 'transparent',
                    maxWidth: 'none',
                  },
                },
                style: {},
              }}
              title={
                <Stack
                  width={500}
                  sx={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    bgcolor: 'background.paper',
                    px: 2,
                    py: 4,
                    borderRadius: '4px',
                  }}
                >
                  <img
                    src={`${MAXAI_CHROME_EXTENSION_WWW_HOMEPAGE_URL}/assets/chrome-extension/openai-api-chat-playground.png`}
                    alt={'open-key-create'}
                    width={'460'}
                    height={'auto'}
                  />
                </Stack>
              }
            >
              <Link
                fontSize={14}
                target={'_blank'}
                rel={`noreferrer noopener nofollow`}
                href={'https://platform.openai.com/playground?mode=chat'}
              >
                {t(
                  'settings:feature_card__openai_api_key__help__discover_active_model__item1__2',
                )}
              </Link>
            </Tooltip>
          </>,
          t(
            'settings:feature_card__openai_api_key__help__discover_active_model__item2',
          ),
          t(
            'settings:feature_card__openai_api_key__help__discover_active_model__item3',
          ),
        ]}
      />
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t('settings:feature_card__openai_api_key__check_credit__title')}
        listType={'number'}
        list={[
          <>
            {t(
              'settings:feature_card__openai_api_key__help__check_credit__item1__1',
            )}
            <Link
              fontSize={14}
              target={'_blank'}
              rel={`noreferrer noopener nofollow`}
              href={'https://platform.openai.com/account/usage'}
            >
              {t(
                'settings:feature_card__openai_api_key__help__check_credit__item1__2',
              )}
            </Link>
          </>,
          t('settings:feature_card__openai_api_key__help__check_credit__item2'),
        ]}
      />
      <PageHelpCard
        defaultOpen={defaultOpen}
        title={t('settings:feature_card__openai_api_key__protips__title')}
        listType={'bullet'}
        list={[
          t('settings:feature_card__openai_api_key__protips__item1'),
          t('settings:feature_card__openai_api_key__protips__item2'),
          t('settings:feature_card__openai_api_key__protips__item3'),
          t('settings:feature_card__openai_api_key__protips__item4'),
        ]}
      />
    </Stack>
  )
}
export default OpenaiAPIKeyHelp
