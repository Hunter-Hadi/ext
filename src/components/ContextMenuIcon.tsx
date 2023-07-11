import React, { FC, useMemo } from 'react'
import KeyboardVoiceOutlinedIcon from '@mui/icons-material/KeyboardVoiceOutlined'
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined'
import DoneIcon from '@mui/icons-material/Done'
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined'
// import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import AutoFixNormalOutlinedIcon from '@mui/icons-material/AutoFixNormalOutlined'
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
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import { SxProps } from '@mui/material/styles'
import { EzMailAIIcon } from '@/components/CustomIcon'
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
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
  'NoteRight',
  'Restart',
  'Translate',
  'Empty',
  'AddCircle',
  'InsertDriveFile',
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
      return (
        <SvgIcon sx={sxMemo}>
          <svg
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g mask="url(#mask0_4388_44569)">
              <path
                d="M6.6476 6.47004C6.59552 6.49372 6.55378 6.53546 6.5301 6.58755L5.89609 7.98238C5.81202 8.16733 5.54931 8.16733 5.46524 7.98238L4.83123 6.58755C4.80755 6.53546 4.76581 6.49372 4.71372 6.47004L3.31889 5.83603C3.13394 5.75196 3.13394 5.48925 3.31889 5.40518L4.71372 4.77117C4.76581 4.74749 4.80755 4.70575 4.83123 4.65366L5.46524 3.25883C5.54931 3.07388 5.81202 3.07388 5.89609 3.25883L6.5301 4.65366C6.55378 4.70575 6.59552 4.74749 6.6476 4.77117L8.04244 5.40518C8.22739 5.48925 8.22739 5.75196 8.04244 5.83603L6.6476 6.47004Z"
                fill="currentColor"
              />
              <path
                d="M19.2017 17.1308C19.2196 17.0914 19.2511 17.0599 19.2904 17.042L21.1083 16.2157C21.2479 16.1522 21.2479 15.9538 21.1083 15.8903L19.2904 15.0641C19.2511 15.0462 19.2196 15.0147 19.2017 14.9753L18.3754 13.1575C18.3119 13.0178 18.1135 13.0178 18.05 13.1575L17.2237 14.9753C17.2059 15.0147 17.1743 15.0462 17.135 15.0641L15.3172 15.8903C15.1775 15.9538 15.1775 16.1522 15.3172 16.2157L17.135 17.042C17.1743 17.0599 17.2059 17.0914 17.2237 17.1308L18.05 18.9486C18.1135 19.0883 18.3119 19.0883 18.3754 18.9486L19.2017 17.1308Z"
                fill="currentColor"
              />
              <path
                d="M5.34743 19.113C5.361 19.0832 5.38492 19.0592 5.41477 19.0457L6.21409 18.6823C6.32008 18.6342 6.32008 18.4836 6.21409 18.4354L5.41477 18.0721C5.38492 18.0586 5.361 18.0346 5.34743 18.0048L4.98411 17.2055C4.93593 17.0995 4.78538 17.0995 4.73721 17.2055L4.37388 18.0048C4.36031 18.0346 4.33639 18.0586 4.30654 18.0721L3.50722 18.4354C3.40124 18.4836 3.40124 18.6342 3.50722 18.6823L4.30654 19.0457C4.33639 19.0592 4.36031 19.0832 4.37388 19.113L4.73721 19.9123C4.78538 20.0183 4.93593 20.0183 4.98411 19.9123L5.34743 19.113Z"
                fill="currentColor"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M16.745 3.90632C17.7576 3.67449 18.7219 3.69153 19.4421 4.13696C20.1875 4.59799 20.4902 5.39185 20.4923 6.13509C20.4945 6.87244 20.2078 7.64551 19.6667 8.20379C19.3983 8.48071 18.9563 8.48762 18.6793 8.21922C18.4025 7.95082 18.3956 7.5088 18.6639 7.23187C18.9374 6.94975 19.097 6.53313 19.0959 6.13901C19.0948 5.75077 18.9448 5.47138 18.7075 5.32469C18.445 5.16232 17.9222 5.06942 17.0566 5.26758C16.2129 5.46072 15.149 5.90828 13.9165 6.65902C12.9072 7.27381 11.7855 8.19024 10.756 9.2785C10.3688 9.80967 10.2498 10.4325 10.2781 11.0355C10.2815 11.1069 10.2868 11.1774 10.294 11.2467C10.5412 10.9344 10.8021 10.6244 11.0772 10.3179C12.4379 8.8023 14.1456 7.37643 16.2728 6.20379C16.6105 6.01755 17.0352 6.14046 17.2213 6.47815C17.4075 6.81585 17.2847 7.24048 16.947 7.42672C15.4921 8.22868 14.2508 9.15593 13.1942 10.1483C13.2371 10.1451 13.2675 10.1417 13.2873 10.1387C13.609 10.0057 13.9866 10.1308 14.1617 10.4418C14.3509 10.7778 14.2319 11.2036 13.8959 11.3928C13.7644 11.4668 13.629 11.496 13.5532 11.5099C13.5143 11.5171 13.4745 11.5229 13.4345 11.5278C13.3816 11.5343 13.3285 11.539 13.2772 11.5424C13.2229 11.546 13.1661 11.5487 13.1075 11.5504C12.9712 11.5544 12.8258 11.5536 12.6825 11.5502C12.4157 11.5438 12.1331 11.5276 11.8884 11.5096C11.4084 12.0651 10.9773 12.6321 10.5909 13.2013C9.72198 14.4812 9.07983 15.7717 8.61685 16.9677C8.97926 16.9795 9.37005 16.9801 9.75948 16.9504C10.5474 16.8903 11.1621 16.7149 11.503 16.409C11.5907 16.3303 11.6736 16.2411 11.7526 16.1428C11.3495 16.2004 10.9814 16.1984 10.6815 16.1968L10.6793 16.1968C10.6309 16.1965 10.5843 16.1962 10.5396 16.1962C10.1539 16.1962 9.84139 15.8837 9.84139 15.498C9.84139 15.1124 10.1539 14.7997 10.5396 14.7997L10.6324 14.7998C11.3689 14.8008 12.0464 14.8015 12.7027 14.2846C12.9677 13.6394 13.3359 12.7911 13.7873 12.1169C14.5332 11.003 15.7926 9.7177 17.1377 8.58214C17.4324 8.33343 17.8729 8.37059 18.1216 8.66533C18.3704 8.95998 18.3332 9.40047 18.0385 9.64926C16.7397 10.7457 15.5904 11.9341 14.9476 12.894C14.5482 13.4904 14.2042 14.2989 13.9306 14.9713C13.6102 15.7591 13.1788 16.7815 12.4357 17.4484C11.7328 18.0791 10.7149 18.278 9.86577 18.3428C9.25013 18.3898 8.635 18.3708 8.14585 18.3451C8.09718 18.5092 8.05252 18.6686 8.01169 18.823C7.87736 19.3318 7.78608 19.7827 7.73161 20.1586C7.6763 20.5402 7.32215 20.8048 6.94048 20.7495C6.5588 20.6942 6.29432 20.34 6.34955 19.9584C6.41271 19.5228 6.5155 19.0194 6.66151 18.4664C6.7002 18.3199 6.74205 18.1696 6.78697 18.016C6.81331 17.9262 6.84075 17.8352 6.86922 17.743C6.35015 16.9674 5.78275 15.5895 6.29211 13.8669C6.87323 11.9016 8.21037 9.94485 9.7115 8.35073C10.8208 7.17272 12.0491 6.16134 13.19 5.46635C14.505 4.66541 15.7105 4.14318 16.745 3.90632ZM7.55953 15.8601C7.46193 15.4044 7.45333 14.8649 7.63129 14.2629C7.89381 13.3749 8.34828 12.4617 8.92744 11.576C8.98855 12.0154 9.09927 12.4141 9.222 12.738C8.53443 13.7942 7.98808 14.8516 7.55953 15.8601Z"
                fill="currentColor"
              />
            </g>
          </svg>
        </SvgIcon>
      )
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
    case 'NoteRight':
      return <NoteRight sx={sxMemo} />
    case 'Restart':
      return <RestartAltOutlinedIcon sx={sxMemo} />
    case 'Translate':
      return <TranslateOutlinedIcon sx={sxMemo} />
    case 'AddCircle':
      return <AddCircleOutlineOutlinedIcon sx={sxMemo} />
    case 'InsertDriveFile':
      return <InsertDriveFileOutlinedIcon sx={sxMemo} />
    case 'Empty':
      return (
        <Box
          sx={{
            display: 'inline-box',
            width: `${size}px`,
            height: `${size}px`,
          }}
        ></Box>
      )
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
const NoteRight: FC<SvgIconProps> = (props) => {
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
          id="mask0_3005_30893"
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="24"
          height="24"
        >
          <rect width="24" height="24" fill="#D9D9D9" />
        </mask>
        <g mask="url(#mask0_3005_30893)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4 21C3.44772 21 3 20.5523 3 20V4C3 3.44772 3.44772 3 4 3H10C10.5523 3 11 3.44772 11 4L11 20C11 20.5523 10.5523 21 10 21H4ZM9 19H5L5 5L9 5L9 19Z"
            fill="currentColor"
          />
          <path
            d="M13.5 3.7998C13.2239 3.7998 13 4.02366 13 4.2998V5.2998C13 5.57595 13.2239 5.7998 13.5 5.7998H20.5C20.7761 5.7998 21 5.57595 21 5.2998V4.2998C21 4.02366 20.7761 3.7998 20.5 3.7998H13.5Z"
            fill="currentColor"
          />
          <path
            d="M13 9.09961C13 8.82347 13.2239 8.59961 13.5 8.59961H20.5C20.7761 8.59961 21 8.82347 21 9.09961V10.0996C21 10.3758 20.7761 10.5996 20.5 10.5996H13.5C13.2239 10.5996 13 10.3758 13 10.0996V9.09961Z"
            fill="currentColor"
          />
          <path
            d="M13 13.8994C13 13.6233 13.2239 13.3994 13.5 13.3994H20.5C20.7761 13.3994 21 13.6233 21 13.8994V14.8994C21 15.1756 20.7761 15.3994 20.5 15.3994H13.5C13.2239 15.3994 13 15.1756 13 14.8994V13.8994Z"
            fill="currentColor"
          />
          <path
            d="M13 18.6992C13 18.4231 13.2239 18.1992 13.5 18.1992H20.5C20.7761 18.1992 21 18.4231 21 18.6992V19.6992C21 19.9754 20.7761 20.1992 20.5 20.1992H13.5C13.2239 20.1992 13 19.9754 13 19.6992V18.6992Z"
            fill="currentColor"
          />
        </g>
      </svg>
    </SvgIcon>
  )
}
export { ContextMenuIcon }
