import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import React, { FC, useState } from 'react'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import CitationFactory from '@/features/citation/core/CitationFactory'
import { IAIResponseSourceCitation } from '@/features/indexed_db/conversations/models/Message'

interface IProps {
  conversationId?: string
  citation: IAIResponseSourceCitation
  index: number
  number?: number
  type?: 'number' | 'icon'
}

const CitationTag: FC<IProps> = (props) => {
  const { conversationId, citation, index, number, type = 'icon' } = props

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')

  const handleClick = async () => {
    if (loading) return
    if (!title) setLoading(true)
    const { content, start_index } = citation
    const citationService = CitationFactory.getCitationService(conversationId)
    if (citationService?.loading) {
      setLoading(false)
      return
    }
    if (citationService) {
      const search = await citationService
        .findText(content, start_index!)
        .catch(console.error)
      setTitle(search?.title || '')
    }
    setLoading(false)
  }

  if (type === 'icon') {
    return (
      <TextOnlyTooltip placement='top' title={`Scroll to page ${title}`}>
        <IconButton
          color='inherit'
          size='small'
          sx={{
            width: 30,
            height: 20,
            top: -1.5,
            // background: 'rgba(138, 101, 171, 0.1)',
            bgcolor: 'primary.main',
            marginRight: '2px!important',
            borderRadius: '14px',
            '&:hover': {
              opacity: 0.6,
              bgcolor: 'primary.main',
            },
          }}
          onClick={handleClick}
        >
          {loading ? (
            <CircularProgress
              size={14}
              sx={{
                m: '0 auto',
                color: '#fff',
              }}
            />
          ) : (
            <FormatListBulletedOutlinedIcon
              sx={{
                fontSize: '16px',
                color: '#fff',
              }}
            />
          )}
        </IconButton>
      </TextOnlyTooltip>
    )
  }

  const content = typeof number === 'number' ? `${number}` : `[${index + 1}]`

  const bgcolor = loading
    ? 'primary.main'
    : (theme: any) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.16)'
          : // : 'rgb(235, 235, 235)'
            'rgba(0, 0, 0, 0.1)'

  const color = loading
    ? '#fff!important'
    : (theme: any) =>
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.87)'
          : 'rgba(0, 0, 0, 0.6)'

  return (
    <Button
      className='maxai-summary-citation'
      variant='contained'
      size='small'
      sx={{
        minWidth: 'auto',
        width: 20,
        height: 20,
        fontSize: '13px!important',
        top: -1,
        pt: '1px!important',
        bgcolor,
        color,
        // marginLeft: '2px!important',
        // marginRight: '2px!important',
        borderRadius: '14px',
        '&:hover': {
          color: '#fff!important',
          bgcolor: 'primary.main',
        },
      }}
      onClick={handleClick}
    >
      {loading ? (
        <CircularProgress
          size={14}
          sx={{
            m: '0 auto',
            color: '#fff',
          }}
        />
      ) : (
        content
      )}
    </Button>
  )

  // return (
  //   <>
  //     <TextOnlyTooltip placement='top' title={`Scroll to page ${title}`}>
  //       <div
  //         style={{ minWidth: 22, display: 'inline-block', textAlign: 'center' }}
  //         onClick={handleClick}
  //       >
  //         {loading ? (
  //           <CircularProgress
  //             size={16}
  //             sx={{
  //               m: '0 auto',
  //               color: 'primary.main',
  //               verticalAlign: 'middle',
  //             }}
  //           />
  //         ) : (
  //           <Link sx={{ cursor: 'pointer' }}>{content}</Link>
  //         )}
  //       </div>
  //     </TextOnlyTooltip>
  //   </>
  // )
}

export default CitationTag
