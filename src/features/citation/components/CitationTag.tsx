import FormatListBulletedOutlinedIcon from '@mui/icons-material/FormatListBulletedOutlined'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import React, { FC, useState } from 'react'

import TextOnlyTooltip from '@/components/TextOnlyTooltip'
import { IAIResponseSourceCitation } from '@/features/chatgpt/types'
import CitationFactory from '@/features/citation/core/CitationFactory'

interface IProps {
  citations: IAIResponseSourceCitation[]
  index: number
}

const CitationTag: FC<IProps> = (props) => {
  const { citations, index } = props

  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')

  const handleClick = async () => {
    if (loading) return
    const { content } = citations[index]
    setLoading(true)
    const citationService = CitationFactory.getCitationService()
    if (citationService) {
      const title = await citationService.findText(content).catch(console.error)
      setTitle(title || '')
    }
    setLoading(false)
  }

  return (
    <>
      <TextOnlyTooltip placement="top" title={`Scroll to page ${title}`}>
        <IconButton
          color="inherit"
          size="small"
          sx={{
            width: 30,
            height: 24,
            background: 'rgba(138, 101, 171, 0.1)',
            marginRight: '2px!important',
            borderRadius: '14px',
          }}
          onClick={handleClick}
        >
          {loading ? (
            <CircularProgress
              size={16}
              sx={{ m: '0 auto', color: 'primary.main' }}
            />
          ) : (
            <FormatListBulletedOutlinedIcon
              sx={{
                fontSize: '16px',
                color: 'primary.main',
              }}
            />
          )}
        </IconButton>
      </TextOnlyTooltip>

      {/*<TextOnlyTooltip placement="top" title={`Scroll to page ${title}`}>*/}
      {/*  {loading ? (*/}
      {/*    <CircularProgress*/}
      {/*      size={16}*/}
      {/*      sx={{ m: '0 auto', color: 'primary.main' }}*/}
      {/*    />*/}
      {/*  ) : (*/}
      {/*    <Link sx={{ cursor: 'pointer' }}>[{index + 1}]</Link>*/}
      {/*  )}*/}
      {/*</TextOnlyTooltip>*/}

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
