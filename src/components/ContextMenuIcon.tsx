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
import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined'
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import TipsAndUpdatesOutlinedIcon from '@mui/icons-material/TipsAndUpdatesOutlined'
import SentimentSatisfiedAltOutlinedIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined'
import ThumbDownOutlinedIcon from '@mui/icons-material/ThumbDownOutlined'
import SupportOutlinedIcon from '@mui/icons-material/SupportOutlined'
import OutletOutlinedIcon from '@mui/icons-material/OutletOutlined'
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined'
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined'
import ExtensionOutlinedIcon from '@mui/icons-material/ExtensionOutlined'
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined'
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined'
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ReplyIcon from '@mui/icons-material/Reply'
import ModeEditOutlinedIcon from '@mui/icons-material/ModeEditOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined'
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined'
import FastForwardOutlinedIcon from '@mui/icons-material/FastForwardOutlined'
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined'
import { SxProps } from '@mui/material/styles'
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
  'SentimentSatisfiedAlt',
  'Campaign',
  'WbSunny',
  'School',
  'SmartToy',
  'ThumbUp',
  'ThumbDown',
  'Support',
  'Outlet',
  'HelpOutline',
  'FavoriteBorder',
  'Label',
  'Extension',
  'AccessTime',
  'DarkMode',
  'Image',
  'EmojiEvents',
  'RemoveRedEye',
  'Share',
  'Email',
  'Reply',
  'Settings',
  'Lock',
  'VisibilityOff',
  'Close',
  'CloseCircled',
  'PlayArrow',
  'FastForward',
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
      return <ModeEditOutlinedIcon sx={sxMemo} />
    case 'Autorenew':
      return <AutorenewOutlinedIcon sx={sxMemo} />
    case 'ListAlt':
      return <ListAltOutlinedIcon sx={sxMemo} />
    case 'StarBorder':
      return <StarBorderIcon sx={sxMemo} />
    case 'TipsAndUpdates':
      return <TipsAndUpdatesOutlinedIcon sx={sxMemo} />
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
    case 'ThumbUp':
      return <ThumbUpOutlinedIcon sx={sxMemo} />
    case 'ThumbDown':
      return <ThumbDownOutlinedIcon sx={sxMemo} />
    case 'Support':
      return <SupportOutlinedIcon sx={sxMemo} />
    case 'Outlet':
      return <OutletOutlinedIcon sx={sxMemo} />
    case 'HelpOutline':
      return <HelpOutlineOutlinedIcon sx={sxMemo} />
    case 'FavoriteBorder':
      return <FavoriteBorderOutlinedIcon sx={sxMemo} />
    case 'Label':
      return <LabelOutlinedIcon sx={sxMemo} />
    case 'Extension':
      return <ExtensionOutlinedIcon sx={sxMemo} />
    case 'AccessTime':
      return <AccessTimeOutlinedIcon sx={sxMemo} />
    case 'DarkMode':
      return <DarkModeOutlinedIcon sx={sxMemo} />
    case 'Image':
      return <ImageOutlinedIcon sx={sxMemo} />
    case 'EmojiEvents':
      return <EmojiEventsOutlinedIcon sx={sxMemo} />
    case 'RemoveRedEye':
      return <RemoveRedEyeOutlinedIcon sx={sxMemo} />
    case 'Share':
      return <ShareOutlinedIcon sx={sxMemo} />
    case 'Email':
      return <EmailOutlinedIcon sx={sxMemo} />
    case 'Reply':
      return <ReplyIcon sx={sxMemo} />
    case 'Settings':
      return <SettingsOutlinedIcon sx={sxMemo} />
    case 'Lock':
      return <LockOutlinedIcon sx={sxMemo} />
    case 'VisibilityOff':
      return <VisibilityOffOutlinedIcon sx={sxMemo} />
    case 'Close':
      return <CloseOutlinedIcon sx={sxMemo} />
    case 'PlayArrow':
      return <PlayArrowOutlinedIcon sx={sxMemo} />
    case 'FastForward':
      return <FastForwardOutlinedIcon sx={sxMemo} />
    case 'CloseCircled':
      return <CancelOutlinedIcon sx={sxMemo} />
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
