import React, { useState } from 'react'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
interface TextListProps {
  title: string
  children?: React.ReactNode
}

const ChatGPTExpandList: React.FC<TextListProps> = ({ title, children }) => {
  const [expanded, setExpanded] = useState(false)
  const handleExpandClick = () => {
    setExpanded(!expanded)
  }
  return (
    <Stack width={'100%'}>
      <Stack
        direction={'row'}
        alignItems={'center'}
        color={'text.secondary'}
        sx={{ cursor: 'pointer' }}
        onClick={handleExpandClick}
      >
        {expanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
        <Typography fontSize={'14px'}>{title}</Typography>
        <Typography fontSize={12} color={'text.secondary'} ml={'auto'} mr={0}>
          Tip: Press Shift+Return for new line
        </Typography>
      </Stack>
      <Collapse
        in={expanded}
        timeout="auto"
        unmountOnExit
        sx={{
          textAlign: 'left',
        }}
      >
        {children}
      </Collapse>
    </Stack>
  )
}

const SEND_EMAIL_EXAMPLES = [
  `Write an email to a company inquiring about their product`,
  `Write an email to my professor asking for an assignment`,
  `Write an email to a customer apologizing for an delayed order`,
  `Write an email to my supervisor requesting time off`,
]
const ChatGPTSendEmailExampleList: React.FC = () => {
  return (
    <ChatGPTExpandList title={'See examples'}>
      <Stack fontSize={12} color={'text.secondary'}>
        {SEND_EMAIL_EXAMPLES.map((text, index) => {
          return (
            <Typography sx={{ fontStyle: 'oblique' }} key={index} fontSize={12}>
              <span
                style={{
                  fontStyle: 'normal',
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  fontSize: '20px',
                  lineHeight: '12px',
                  position: 'relative',
                  top: '2px',
                }}
              >
                •
              </span>
              {text}
            </Typography>
          )
        })}
      </Stack>
    </ChatGPTExpandList>
  )
}

const REPLY_EMAIL_EXAMPLES = [
  `Write a reply to this email declining the job offer:`,
  `Write a reply to this email requesting a refund:`,
  `Write a reply to this email accepting the invitation:`,
  `Write a reply to this email to accept the opportunity:`,
]

const ChatGPTReplyEmailExampleList: React.FC = () => {
  return (
    <ChatGPTExpandList title={'See examples'}>
      <Stack fontSize={12} color={'text.secondary'}>
        {REPLY_EMAIL_EXAMPLES.map((text, index) => {
          return (
            <Typography sx={{ fontStyle: 'oblique' }} key={index} fontSize={12}>
              <span
                style={{
                  fontStyle: 'normal',
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  fontSize: '20px',
                  lineHeight: '12px',
                  position: 'relative',
                  top: '2px',
                }}
              >
                •
              </span>
              {text}
            </Typography>
          )
        })}
      </Stack>
    </ChatGPTExpandList>
  )
}
const DEFAULT_EXAMPLES = [
  `Write an outline for marketing tips`,
  `Write a paragraph about project management`,
  `Explain quantum computing in simple terms`,
  `Got any creative ideas for a 10 year old's birthday?`,
]

const ChatGPTDefaultExampleList: React.FC = () => {
  return (
    <ChatGPTExpandList title={'See examples'}>
      <Stack fontSize={12} color={'text.secondary'}>
        {DEFAULT_EXAMPLES.map((text, index) => {
          return (
            <Typography sx={{ fontStyle: 'oblique' }} key={index} fontSize={12}>
              <span
                style={{
                  fontStyle: 'normal',
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  fontSize: '20px',
                  lineHeight: '12px',
                  position: 'relative',
                  top: '2px',
                }}
              >
                •
              </span>
              {text}
            </Typography>
          )
        })}
      </Stack>
    </ChatGPTExpandList>
  )
}

export {
  ChatGPTExpandList,
  ChatGPTSendEmailExampleList,
  ChatGPTReplyEmailExampleList,
  ChatGPTDefaultExampleList,
}
