import React, { FC, useContext } from 'react'
import { SxProps } from '@mui/material/styles'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import {
  SettingsPageRouteContext,
  settingsPageRouterList,
} from '@/pages/settings/context'
import Divider from '@mui/material/Divider'
import { useTranslation } from 'react-i18next'

const OptionsLeftMenu: FC<{
  sx?: SxProps
}> = (props) => {
  const { t } = useTranslation('settings')
  const { route, setRoute } = useContext(SettingsPageRouteContext)
  const { sx } = props
  return (
    <List component="nav" sx={{ py: 2, ...sx }}>
      {settingsPageRouterList.map((menuItem) => {
        return (
          <React.Fragment key={menuItem.route}>
            <ListItemButton
              sx={{
                p: '4px 16px',
              }}
              selected={route === menuItem.route}
              onClick={() => {
                setRoute(menuItem.route)
              }}
            >
              <ListItemText primary={t(menuItem.label as any)} />
            </ListItemButton>
            {menuItem.divider && <Divider sx={{ my: 1 }} />}
          </React.Fragment>
        )
      })}
    </List>
  )
}

export default OptionsLeftMenu
