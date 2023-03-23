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
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined'
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'

import { SxProps } from '@mui/material'
import { EzMailAIIcon } from '@/components/CustomIcon'
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
  'Autorenew',
  'ListAlt',
  'StarBorder',
  'TipsAndUpdates',
  'ThumbUpAlt',
  'SentimentSatisfiedAlt',
  'Campaign',
  'WbSunny',
  'School',
  'SmartToy',
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
    case 'Autorenew':
      return <AutorenewOutlinedIcon sx={sxMemo} />
    case 'ListAlt':
      return <ListAltOutlinedIcon sx={sxMemo} />
    case 'StarBorder':
      return <StarBorderIcon sx={sxMemo} />
    case 'TipsAndUpdates':
      return <TipsAndUpdatesOutlinedIcon sx={sxMemo} />
    case 'ThumbUpAlt':
      return <ThumbUpAltOutlinedIcon sx={sxMemo} />
    case 'SentimentSatisfiedAlt':
      return <SentimentSatisfiedAltOutlinedIcon sx={sxMemo} />
    case 'Campaign':
      return <CampaignOutlinedIcon sx={sxMemo} />
    case 'WbSunny':
      return <WbSunnyOutlinedIcon sx={sxMemo} />
    case 'School':
      return <SchoolOutlinedIcon sx={sxMemo} />
    case 'SmartToy':
      return <SmartToyOutlinedIcon sx={sxMemo} />
    case 'EzMail':
      return <EzMailAIIcon sx={sxMemo} />
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
