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
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined'
import FormatAlignLeftOutlinedIcon from '@mui/icons-material/FormatAlignLeftOutlined'

import { SxProps } from '@mui/material/styles'
import { EzMailAIIcon } from '@/components/CustomIcon'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
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
  'Delete',
  'Copy',
  'Replay',
  'FormatAlignLeft',
  'NoteUp',
  'NoteDown',
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
    case 'Delete':
      return <DeleteOutlineOutlinedIcon sx={sxMemo} />
    case 'Copy':
      return <ContentCopyOutlinedIcon sx={sxMemo} />
    case 'Replay':
      return <ReplayOutlinedIcon sx={sxMemo} />
    case 'FormatAlignLeft':
      return <FormatAlignLeftOutlinedIcon sx={sxMemo} />
    case 'NoteUp':
      return <NoteUp sx={sxMemo} />
    case 'NoteDown':
      return <NoteDown sx={sxMemo} />
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

/**
 * custom svg icon
 */
const NoteUp: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_3002_30728"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <rect width="24" height="24" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_3002_30728)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 20.75C3.44772 20.75 3 20.3023 3 19.75V14.75C3 14.1977 3.44772 13.75 4 13.75H20C20.5523 13.75 21 14.1977 21 14.75V19.75C21 20.3023 20.5523 20.75 20 20.75H4ZM5 18.75V15.75H19V18.75H5Z"
            fill="currentColor"
          />
          <path d="M21 11.75H11V9.75H21V11.75Z" fill="currentColor" />
          <path d="M21 7.75H13V5.75H21V7.75Z" fill="currentColor" />
          <path
            d="M5 7.75V11.75H3V6.75C3 6.46667 3.09583 6.22917 3.2875 6.0375C3.47917 5.84583 3.71667 5.75 4 5.75H7.5V3.25L11 6.75L7.5 10.25V7.75H5Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </SvgIcon>
  )
}

const NoteDown: FC<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <mask
          id="mask0_3002_30691"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <rect width="24" height="24" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_3002_30691)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 3.25C3.44772 3.25 3 3.69772 3 4.25V9.25C3 9.80228 3.44772 10.25 4 10.25H20C20.5523 10.25 21 9.80228 21 9.25V4.25C21 3.69772 20.5523 3.25 20 3.25H4ZM5 5.25V8.25H19V5.25H5Z"
            fill="currentColor"
          />
          <path d="M21 12.25H11V14.25H21V12.25Z" fill="currentColor" />
          <path d="M21 16.25H13V18.25H21V16.25Z" fill="currentColor" />
          <path
            d="M5 16.25V12.25H3V17.25C3 17.5333 3.09583 17.7708 3.2875 17.9625C3.47917 18.1542 3.71667 18.25 4 18.25H7.5V20.75L11 17.25L7.5 13.75V16.25H5Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </SvgIcon>
  )
}

export { ContextMenuIcon }
