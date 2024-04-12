import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Radio from '@mui/material/Radio'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import React, { type FC, memo, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import {
  ChromeExtensionDBStorageSnapshot,
  getChromeExtensionDBStorageSnapshotList,
} from '@/background/utils/chromeExtensionStorage/chromeExtensionDBStorageSnapshot'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import SettingPromptsActionConfirmModal from '@/pages/settings/pages/prompts/components/SettingPromptsActionConfirmModal'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'

const SettingPromptsRestoreDialog: FC<{
  onClose: () => void
  onRestore: (snapshot: ChromeExtensionDBStorageSnapshot) => void
}> = (props) => {
  const { t } = useTranslation(['settings', 'common'])
  const [editButtonKey] = useRecoilState(SettingPromptsEditButtonKeyAtom)
  const [open, setOpen] = useState(true)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmType, setConfirmType] = useState<
    'restore' | 'deleteAll' | undefined
  >(undefined)
  const [
    selectedSnapshot,
    setSelectedSnapshot,
  ] = useState<ChromeExtensionDBStorageSnapshot | null>(null)
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
            {editButtonKey && filterSnapshotList.map((snapshot) => {
              const isSelected = snapshot.version === selectedSnapshot?.version
              const ownPrompts =
                snapshot.settings.buttonSettings?.[editButtonKey]?.contextMenu.filter(
                  (item) => item.data.editable,
                )?.length || 0
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
                        <Typography fontSize={16} color={'text.primary'}>{`${t(
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
                  )}: ${ownPrompts})`}</Typography>
                </ListItemButton>
              )
            })}
          </List>
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
          <Button
            variant={'outlined'}
            color={'error'}
            onClick={() => {
              setConfirmType('deleteAll')
              setConfirmOpen(true)
            }}
            sx={{ ml: 'auto!important' }}
          >
            {t(
              'settings:feature_card__prompts__restore__dialog__delete_all_button',
            )}
          </Button>
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
