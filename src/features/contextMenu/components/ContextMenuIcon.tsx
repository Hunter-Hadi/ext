import React, { FC, useMemo } from 'react'
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import DoneIcon from '@mui/icons-material/Done'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import ShortTextIcon from '@mui/icons-material/ShortText'
import SubjectIcon from '@mui/icons-material/Subject'
import SummarizeOutlinedIcon from '@mui/icons-material/SummarizeOutlined'
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined'
import QuestionMarkOutlinedIcon from '@mui/icons-material/QuestionMarkOutlined'
import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline'
import { SxProps } from '@mui/material'
export const CONTEXT_MENU_ICONS = [
  'AutoFix',
  'Done',
  'LongText',
  'ShortText',
  'Voice',
  'AutoAwesome',
  'Summarize',
  'Language',
  'Question',
  'Bulleted',
  'More',
  'DefaultIcon',
] as const
export type IContextMenuIconKey = (typeof CONTEXT_MENU_ICONS)[number]
const ContextMenuIcon: FC<{
  icon: IContextMenuIconKey | string
  size?: number
  sx?: SxProps
}> = (props) => {
  const { icon, size = 16, sx } = props
  const sxMemo = useMemo(
    () => ({
      fontSize: size,
      color: 'inherit',
      ...sx,
    }),
    [sx],
  )
  switch (icon) {
    case 'AutoFix':
      return <AutoFixHighOutlinedIcon sx={sxMemo} />
    case 'Voice':
      return <KeyboardVoiceOutlinedIcon sx={sxMemo} />
    case 'Done':
      return <DoneIcon sx={sxMemo} />
    case 'LongText':
      return <SubjectIcon sx={sxMemo} />
    case 'ShortText':
      return <ShortTextIcon sx={sxMemo} />
    case 'AutoAwesome':
      return <AutoAwesomeIcon sx={sxMemo} />
    case 'Summarize':
      return <SummarizeOutlinedIcon sx={sxMemo} />
    case 'Language':
      return <LanguageOutlinedIcon sx={sxMemo} />
    case 'Question':
      return <QuestionMarkOutlinedIcon sx={sxMemo} />
    case 'Bulleted':
      return <FormatListBulletedOutlinedIcon sx={sxMemo} />
    case 'More':
      return <MoreHorizIcon sx={sxMemo} />
    case 'DefaultIcon':
      return <DriveFileRenameOutlineIcon sx={sxMemo} />
    default:
      if (icon.toString().startsWith('http')) {
        return (
          <img
            src={String(icon)}
            alt={'custom icon'}
            width={size}
            height={size}
          />
        )
      }
      return <></>
  }
}
export { ContextMenuIcon }
