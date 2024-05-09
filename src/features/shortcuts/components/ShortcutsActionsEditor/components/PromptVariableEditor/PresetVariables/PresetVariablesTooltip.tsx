import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRecoilState } from 'recoil'

import {
  IPresetVariablesGroupItem,
  PRESET_VARIABLES_GROUP_MAP,
} from '@/features/shortcuts/components/ShortcutsActionsEditor/hooks/useShortcutEditorActionsVariables'
import { SettingPromptsEditButtonKeyAtom } from '@/pages/settings/pages/prompts/store'
import { SxProps } from '@mui/material/styles'

const PresetVariablesTable: FC<{
  tableData: IPresetVariablesGroupItem[]
}> = (props) => {
  const { t } = useTranslation(['prompt_editor'])
  const { tableData } = props
  return (
    <Stack p={1}>
      <Stack
        sx={{
          borderColor: 'customColor.borderColor',
          borderRadius: '4px',
          borderStyle: 'solid',
          borderWidth: '1px',
        }}
      >
        <Table
          size={'small'}
          sx={{
            minWidth: 650,
            '& .MuiTableCell-head': {
              bgcolor: (t) =>
                t.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, .04)'
                  : 'rgba(0, 0, 0, .04)',
            },
            '& tr > th:first-child': {
              borderRightWidth: '1px',
              borderRightStyle: 'solid',
              borderRightColor: 'customColor.borderColor',
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell>
                {t(
                  'prompt_editor:preset_variables__tooltip__table__column_name__placeholder__title',
                )}
              </TableCell>
              <TableCell align="left">
                {t(
                  'prompt_editor:preset_variables__tooltip__table__column_name__description__title',
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((variableGroupItem) => {
              const variable = variableGroupItem.variable
              const description = variableGroupItem.description
              const required = variableGroupItem.requiredInSettingEditor
              return (
                <TableRow
                  key={variable.VariableName}
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row">
                    {`{{${variable.label}}}`}
                    {required && (
                      <span style={{ marginLeft: '2px', color: 'red' }}>*</span>
                    )}
                  </TableCell>
                  <TableCell align="left">{t(description as any)}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Stack>
    </Stack>
  )
}
const PopperId = 'preset-variables-tooltip'

const PresetVariablesTooltip: FC<{ sx?: SxProps }> = ({ sx }) => {
  const { t } = useTranslation(['prompt_editor'])
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [settingPromptsEditButtonKey] = useRecoilState(
    SettingPromptsEditButtonKeyAtom,
  )
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const id = open ? PopperId : undefined

  return (
    <>
      <IconButton aria-describedby={PopperId} onClick={handleClick} sx={sx}>
        <HelpOutlineIcon fontSize="small" />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <Box maxWidth={'60vw'} maxHeight={420} overflow="auto" p={1}>
          <Typography
            variant="body2"
            sx={{
              whiteSpace: 'pre-line',
            }}
          >
            {t('prompt_editor:preset_variables__help__title')}
            <br />
            <br />
            {t('prompt_editor:preset_variables__help__description')}
            <br />
            <br />
            <Divider sx={{ my: 1 }} />
          </Typography>
          {Object.keys(PRESET_VARIABLES_GROUP_MAP).map(
            (groupKey, index, array) => {
              const variables = PRESET_VARIABLES_GROUP_MAP[groupKey].filter(
                ({ permissionKeys = [] }) =>
                  permissionKeys.length === 0 ||
                  permissionKeys.includes(settingPromptsEditButtonKey!),
              )
              return (
                <Stack key={groupKey} spacing={2} mt={3}>
                  <Typography variant="body2">
                    {`${t(
                      'prompt_editor:preset_variables__tooltip__variable_name_prefix',
                    )} "${t(groupKey as any)}"`}
                  </Typography>
                  <PresetVariablesTable tableData={variables} />
                  {index !== array.length - 1 && <Divider />}
                </Stack>
              )
            },
          )}
        </Box>
      </Popover>
    </>
  )
}
export default PresetVariablesTooltip
