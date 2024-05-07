import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import { SxProps } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { isEqual } from 'lodash-es'
import cloneDeep from 'lodash-es/cloneDeep'
import uniq from 'lodash-es/uniq'
import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'
import Browser from 'webextension-polyfill'

import { IVisibilitySetting } from '@/background/utils/chromeExtensionStorage/type'
import { ContextMenuIcon } from '@/components/ContextMenuIcon'
import DomainSelect from '@/components/select/DomainSelect'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'
import { domain2Favicon } from '@/utils/dataHelper/websiteHelper'

/**
 * 控制黑白名单的卡片
 * @param props
 * @constructor
 * @version 1.0 - 根据黑白名单模式切换和保存
 * @version 2.0 - 仿照chrome只保留单独黑名单/白名单模式
 */

const VisibilitySettingCard: FC<{
  sx?: SxProps
  defaultValue: IVisibilitySetting
  onChange: (value: IVisibilitySetting) => void
  disabled?: boolean
  mode: 'black' | 'white'
}> = (props) => {
  const { defaultValue, onChange, disabled, mode } = props
  const isBlackMode = mode === 'black'
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )

  const { t } = useTranslation(['settings', 'common'])
  const [newSite, setNewSite] = useState([''])
  const [open, setOpen] = useState(false)
  const BoxRef = useRef<HTMLDivElement>(null)
  const handleOpen = () => {
    setNewSite([''])
    setOpen(true)
    setTimeout(() => {
      BoxRef.current?.querySelector('input')?.focus()
    }, 100)
  }
  const handleClose = () => {
    setOpen(false)
  }
  const handleSubmit = () => {
    if (isBlackMode) {
      setVisibilitySetting({
        ...visibilitySetting,
        isWhitelistMode: false,
        blacklist: uniq([...newSite, ...visibilitySetting.blacklist]).filter(
          Boolean,
        ),
      })
    } else {
      setVisibilitySetting({
        ...visibilitySetting,
        isWhitelistMode: true,
        whitelist: uniq([...newSite, ...visibilitySetting.whitelist]).filter(
          Boolean,
        ),
      })
    }
    setOpen(false)
    setTimeout(() => {
      setOpen(false)
    }, 0)
  }
  const isInitial = useRef(false)
  const [visibilitySetting, setVisibilitySetting] =
    useState<IVisibilitySetting>(() => {
      return cloneDeep(defaultValue)
    })
  useEffect(() => {
    if (!isInitial.current) {
      if (!isEqual(defaultValue, visibilitySetting)) {
        isInitial.current = true
      } else {
        return
      }
    }
    if (visibilitySetting.isWhitelistMode) {
      if (visibilitySetting.whitelist.length === 0) {
        setVisibilitySetting({
          ...visibilitySetting,
          isWhitelistMode: false,
          blacklist: [],
          whitelist: [],
        })
        return
      }
    }
    console.log('save visibilitySetting', visibilitySetting)
    onChange(visibilitySetting)
  }, [visibilitySetting])

  const memoizedDomains = useMemo(() => {
    return visibilitySetting.isWhitelistMode
      ? visibilitySetting.whitelist
      : visibilitySetting.blacklist
  }, [visibilitySetting])

  return (
    <Stack sx={{ ...props.sx }}>
      {/*<p>{JSON.stringify(visibilitySetting)}</p>*/}
      {/*<p>mode: {isBlackMode ? 'black' : 'white'}</p>*/}
      {/*<p>*/}
      {/*  {JSON.stringify(*/}
      {/*    visibilitySetting.isWhitelistMode*/}
      {/*      ? visibilitySetting.whitelist*/}
      {/*      : visibilitySetting.blacklist,*/}
      {/*  )}*/}
      {/*</p>*/}
      <List
        sx={{
          p: 0,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgb(32, 33, 36)'
              : 'rgb(255,255,255)',
          borderRadius: '4px',
          border: '1px solid',
          borderColor: 'customColor.borderColor',
          '& .MuiListItem-root': {
            p: 2,
          },
          '& .MuiListItemText-root': {
            m: 0,
            mr: 2,
          },
        }}
      >
        <ListItem sx={{ p: 0 }}>
          <ListItemText
            primary={
              isBlackMode
                ? t('settings:visibility_card__black_list_title')
                : t('settings:visibility_card__white_list_title')
            }
            secondary={
              isBlackMode
                ? t('settings:visibility_card__black_list_description')
                : t('settings:visibility_card__white_list_description')
            }
          />
          <Button
            variant={'outlined'}
            sx={{
              flexShrink: 0,
              borderColor: 'customColor.borderColor',
              color: 'text.primary',
            }}
            onClick={handleOpen}
            disabled={disabled}
          >
            {t('common:add')}
          </Button>
        </ListItem>
        {memoizedDomains.map((site) => {
          const isPDFViewer = settingPromptsEditButtonKey === 'sidebarSummaryButton' && site === Browser.runtime.getURL('/pages/pdf/web/viewer.html')
          const favicon = domain2Favicon(isPDFViewer ? 'maxai.me' : site)
          const website = isPDFViewer ? 'MaxAI PDF Viewer' : site
          return (
            <ListItem
              key={site}
              sx={{
                boxSizing: 'border-box',
                p: '12px 16px',
                borderTop: '1px solid',
                borderColor: 'customColor.borderColor',
              }}
            >
              <ListItemText
                primary={
                  <Stack direction={'row'} alignItems={'center'} spacing={2}>
                    <img
                      src={favicon}
                      alt={site}
                      style={{
                        width: 20,
                        height: 20,
                        flexShrink: 0,
                      }}
                    />
                    <Typography component={'span'} noWrap fontSize={14}>
                      {website}
                    </Typography>
                  </Stack>
                }
              />
              <IconButton
                sx={{ flexShrink: 0 }}
                disabled={disabled}
                onClick={() => {
                  if (isBlackMode) {
                    setVisibilitySetting({
                      ...visibilitySetting,
                      blacklist: visibilitySetting.blacklist.filter(
                        (item) => item !== site,
                      ),
                    })
                  } else {
                    setVisibilitySetting({
                      ...visibilitySetting,
                      whitelist: visibilitySetting.whitelist.filter(
                        (item) => item !== site,
                      ),
                    })
                  }
                }}
              >
                <ContextMenuIcon icon={'Delete'} sx={{ fontSize: 20 }} />
              </IconButton>
            </ListItem>
          )
        })}
      </List>
      <Dialog
        open={open}
        onClose={handleClose}
        onKeyDownCapture={(event) => {
          if (event.key === 'Enter' && newSite[0]) {
            handleSubmit()
          }
        }}
      >
        <DialogTitle>
          {t('settings:visibility_card__add_a_site_dialog__title')}
        </DialogTitle>
        <DialogContent>
          <Stack width={500} ref={BoxRef} spacing={1}>
            <Typography fontSize={16}>
              {t(
                'settings:visibility_card__add_a_site_dialog__field_site__title',
              )}
            </Typography>
            <DomainSelect
              label={t(
                'settings:visibility_card__add_a_site_dialog__field_site__placeholder',
              )}
              value={newSite}
              sx={{
                width: '100%',
              }}
              disabled={disabled}
              onChange={async (value) => {
                if (!value) {
                  return
                }
                setNewSite(value)
              }}
            // multiple={Boolean(
            //   settingPromptsEditButtonKey &&
            //     inputAssistantButtonKeys.includes(
            //       settingPromptsEditButtonKey,
            //     ),
            // )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant={'outlined'} onClick={handleClose}>
            {t('common:cancel')}
          </Button>
          <Button
            disabled={!newSite[0]}
            variant={'contained'}
            onClick={handleSubmit}
          >
            {t('common:add')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}

export default VisibilitySettingCard
