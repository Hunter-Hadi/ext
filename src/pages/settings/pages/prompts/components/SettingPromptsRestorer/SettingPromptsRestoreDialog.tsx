import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Pagination from '@mui/material/Pagination'
import Radio from '@mui/material/Radio'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import orderBy from 'lodash-es/orderBy'
import sum from 'lodash-es/sum'
import React, { type FC, memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ChromeExtensionDBStorageSnapshot,
  getChromeExtensionDBStorageSnapshotList,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorageSnapshot'
import {
  IChromeExtensionButtonSetting,
  IChromeExtensionButtonSettingKey,
} from '@/background/utils/chromeExtensionStorage/type'
import AppLoadingLayout from '@/features/common/components/AppLoadingLayout'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import { clientFetchMaxAIAPI } from '@/features/shortcuts/utils'
import SettingPromptsActionConfirmModal from '@/pages/settings/pages/prompts/components/SettingPromptsActionConfirmModal'

const useOwnPromptsSnapshotList = () => {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(5)
  const [total, setTotal] = useState(-1)
  // - list_button_settings_restore
  const query = useQuery({
    queryKey: ['list_button_settings_restore', page, pageSize],
    queryFn: async () => {
      const result = await clientFetchMaxAIAPI<{
        data: Array<{
          insert_time: string
          buttonSettings?: {
            [key in IChromeExtensionButtonSettingKey]: IChromeExtensionButtonSetting
          }
        }>
        total_page: number
        status: string
      }>('/user/list_button_settings_restore', {
        page,
        page_size: pageSize,
      })
      if (result.data?.status !== 'OK') {
        throw new Error('Fetch failed')
      }
      if (result.data.total_page > 0) {
        setTotal(result.data.total_page + 1)
      }
      return result.data.data
    },
    refetchOnWindowFocus: false,
  })
  const nextPage = () => {
    setPage(page + 1)
  }
  const prevPage = () => {
    setPage(page - 1)
  }
  const setPageSizeAndReset = (size: number) => {
    setPageSize(size)
    setPage(1)
  }
  return {
    loading: query.isLoading || query.isError,
    data: query.data,
    page: page + 1,
    nextPage,
    prevPage,
    updatePage: setPage,
    setPageSizeAndReset,
    total,
  }
}

const SettingPromptsRestoreDialog: FC<{
  onClose: () => void
  onRestore: (snapshot: ChromeExtensionDBStorageSnapshot) => void
}> = (props) => {
  const { data, loading, total, page, updatePage } = useOwnPromptsSnapshotList()
  const { t } = useTranslation(['settings', 'common'])
  const [open, setOpen] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmType, setConfirmType] = useState<
    'restore' | 'deleteAll' | undefined
  >(undefined)
  const [selectedSnapshot, setSelectedSnapshot] =
    useState<ChromeExtensionDBStorageSnapshot | null>(null)
  const [snapshotList, setSnapshotList] = useState<
    ChromeExtensionDBStorageSnapshot[]
  >([])
  const filterSnapshotList = useMemo(() => {
    return snapshotList.filter((snapshot) => !snapshot.isDefault)
  }, [snapshotList])
  useEffectOnce(() => {
    getChromeExtensionDBStorageSnapshotList().then((list) => {
      setSnapshotList(list)
    })
  })
  const owmPromptsSnapshotList = useMemo(() => {
    // 把db中的数据转换成前端需要的数据格式
    let mergeSnapshotList: ChromeExtensionDBStorageSnapshot[] =
      data?.map((item) => {
        return {
          isDefault: false,
          version: dayjs(item.insert_time).utc().valueOf().toString(),
          timestamp: dayjs(item.insert_time).utc().valueOf(),
          settings: {
            buttonSettings: item.buttonSettings,
          },
        }
      }) || []
    if (mergeSnapshotList.length === 0) {
      // 防止是最后一页的时候，没有数据
      if (page === 1) {
        return filterSnapshotList
      }
      return []
    }
    // 最早的时间
    const latestTime = dayjs(mergeSnapshotList[0].timestamp).utc().valueOf()
    // 最晚的时间
    const earliestTime = dayjs(
      mergeSnapshotList[mergeSnapshotList.length - 1].timestamp,
    )
      .utc()
      .valueOf()
    // 如果本地的数据在这个区间内，就把本地的数据加进去
    for (let i = 0; i < filterSnapshotList.length; i++) {
      const snapshot = filterSnapshotList[i]
      const snapshotTime = dayjs(snapshot.timestamp).utc().valueOf()
      if (
        snapshotTime >= earliestTime &&
        snapshotTime <= latestTime &&
        !mergeSnapshotList.find((item) => item.timestamp === snapshot.timestamp)
      ) {
        // 如果符合，需要把本地的数据加进去并且排序
        mergeSnapshotList.push(snapshot)
      } else if (page === 1 && snapshotTime > latestTime) {
        // 如果是第一页，并且本地的数据比最新的数据还要新
        // 就把最新的数据加进去
        mergeSnapshotList.push(snapshot)
      }
    }
    // 排序
    mergeSnapshotList = orderBy(mergeSnapshotList, ['timestamp'], ['desc'])
    return mergeSnapshotList
  }, [data, filterSnapshotList, page])
  const handleClose = () => {
    setOpen(false)
    props.onClose()
  }
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          width: '100%',
          maxWidth: '800px',
        },
      }}
    >
      <DialogTitle>
        {t('settings:feature_card__prompts__restore__dialog__title')}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography fontSize={16} color={'text.secondary'}>
            {t('settings:feature_card__prompts__restore__dialog__description')}
          </Typography>
          <AppLoadingLayout loading={loading}>
            <List
              component={'nav'}
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
                '& > * + .MuiListItem-root': {
                  borderTop: '1px solid',
                  borderColor: 'customColor.borderColor',
                },
              }}
            >
              {owmPromptsSnapshotList.map((snapshot) => {
                const isSelected =
                  snapshot.version === selectedSnapshot?.version
                const ownPromptsCount = snapshot?.settings?.buttonSettings
                  ? sum(
                      Object.keys(snapshot.settings.buttonSettings).map(
                        (buttonKey: string) => {
                          const buttonSetting:
                            | IChromeExtensionButtonSetting
                            | undefined =
                            snapshot.settings?.buttonSettings?.[
                              buttonKey as IChromeExtensionButtonSettingKey
                            ]
                          return buttonSetting?.contextMenu?.length || 0
                        },
                      ),
                    )
                  : 0
                return (
                  <ListItemButton
                    key={snapshot.version}
                    onClick={() => {
                      setSelectedSnapshot(snapshot)
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack
                          direction={'row'}
                          spacing={1}
                          alignItems={'center'}
                        >
                          <Radio checked={isSelected} />
                          <Typography
                            fontSize={16}
                            color={'text.primary'}
                          >{`${t(
                            'settings:feature_card__prompts__restore__dialog__item__description',
                          )} ${dayjs(snapshot.timestamp).format(
                            'MMMM DD, YYYY, HH:mm',
                          )}`}</Typography>
                        </Stack>
                      }
                    ></ListItemText>
                    <Typography
                      component={'span'}
                      sx={{ flexShrink: 0 }}
                      fontSize={16}
                      color={'text.primary'}
                    >{`(${t(
                      'settings:feature_card__prompts__restore__dialog__item__own_prompt_description',
                    )}: ${ownPromptsCount})`}</Typography>
                  </ListItemButton>
                )
              })}
            </List>
          </AppLoadingLayout>
          {total > 0 && (
            <Pagination
              count={total}
              page={page}
              hideNextButton={page === total}
              hidePrevButton={page === 1}
              onChange={(_, value) => {
                updatePage(value - 1)
              }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Stack
          direction={'row'}
          alignItems={'center'}
          justifyContent={'start'}
          spacing={1}
          width={'100%'}
        >
          <Button
            variant={'contained'}
            disabled={!selectedSnapshot}
            onClick={() => {
              setConfirmType('restore')
              setConfirmOpen(true)
            }}
          >
            {t(
              'settings:feature_card__prompts__restore__dialog__restore_button',
            )}
          </Button>
          <Button variant={'outlined'} onClick={handleClose}>
            {t('common:cancel')}
          </Button>
          {/* TODO 理论上这个场景不会出现，因为用户的自定义prompt数据没有理由需要全部删除*/}
          {/*<Button*/}
          {/*  variant={'outlined'}*/}
          {/*  color={'error'}*/}
          {/*  onClick={() => {*/}
          {/*    setConfirmType('deleteAll')*/}
          {/*    setConfirmOpen(true)*/}
          {/*  }}*/}
          {/*  sx={{ ml: 'auto!important' }}*/}
          {/*>*/}
          {/*  {t(*/}
          {/*    'settings:feature_card__prompts__restore__dialog__delete_all_button',*/}
          {/*  )}*/}
          {/*</Button>*/}
        </Stack>
        <SettingPromptsActionConfirmModal
          open={confirmOpen}
          actionType={confirmType}
          onConfirm={() => {
            if (confirmType === 'restore') {
              selectedSnapshot && props.onRestore(selectedSnapshot)
              setSelectedSnapshot(null)
            }
            if (confirmType === 'deleteAll') {
              const defaultSnapshot = snapshotList.find(
                (snapshot) => snapshot.isDefault,
              )
              defaultSnapshot && props.onRestore(defaultSnapshot)
              setSelectedSnapshot(null)
            }
            setConfirmOpen(false)
            handleClose()
          }}
          onClose={() => {
            setConfirmOpen(false)
          }}
        />
      </DialogActions>
    </Dialog>
  )
}
export default memo(SettingPromptsRestoreDialog)
