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
  citations: IAIResponseSourceCitation[]
  index: number
  number?: number
  type?: 'number' | 'icon'
}

const CitationTag: FC<IProps> = (props) => {
  const { conversationId, citations, index, number, type = 'icon' } = props

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')

  const handleClick = async () => {
    if (loading) return
    if (!title) setLoading(true)
    const { content, start_index } = citations[index]
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

  return (
    <Button
      variant='contained'
      size='small'
      sx={{
        minWidth: 'auto',
        width: 24,
        height: 18,
        fontSize: '14px!important',
        top: -1,
        bgcolor: 'primary.main',
        color: '#fff!important',
        marginLeft: '2px!important',
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
