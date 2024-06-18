import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import React, { FC, useState } from 'react'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import CitationFactory from '@/features/citation/core/CitationFactory'
import { IAIResponseSourceCitation } from '@/features/indexed_db/conversations/models/Message'

interface IProps {
  citations: IAIResponseSourceCitation[]
  index: number
  type?: 'number' | 'icon'
}

const CitationTag: FC<IProps> = (props) => {
  const { citations, index, type = 'icon' } = props

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')

  const handleClick = async () => {
    if (loading) return
    if (!title) setLoading(true)
    const { content, start_index } = citations[index]
    const citationService = CitationFactory.getCitationService()
    if (citationService?.loading) {
      setLoading(false)
      return
    }
    if (citationService) {
      const title = await citationService
        .findText(content, start_index!)
        .catch(console.error)
      setTitle(title || '')
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
            height: 24,
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
              size={16}
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

  return (
    <>
      <TextOnlyTooltip placement='top' title={`Scroll to page ${title}`}>
        <div
          style={{ minWidth: 22, display: 'inline-block', textAlign: 'center' }}
          onClick={handleClick}
        >
          {loading ? (
            <CircularProgress
              size={16}
              sx={{
                m: '0 auto',
                color: 'primary.main',
                verticalAlign: 'middle',
              }}
            />
          ) : (
            <Link sx={{ cursor: 'pointer' }}>[{index + 1}]</Link>
          )}
        </div>
      </TextOnlyTooltip>
      {/*{show &&*/}
      {/*  containerGroups.map((group, index) => (*/}
      {/*    <Portal container={group.container} key={index}>*/}
      {/*      {group.matches.map((match, j) => (*/}
      {/*        <div*/}
      {/*          style={{*/}
      {/*            position: 'absolute',*/}
      {/*            top: match.layout.top,*/}
      {/*            left: match.layout.left,*/}
      {/*            width: match.layout.width,*/}
      {/*            height: match.layout.height,*/}
      {/*            background: 'rgba(0,0,0,0.2)',*/}
      {/*          }}*/}
      {/*        >*/}
      {/*        </div>*/}
      {/*      ))}*/}
      {/*    </Portal>*/}
      {/*  ))}*/}
    </>
  )
}

export default CitationTag
