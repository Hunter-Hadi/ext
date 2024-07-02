import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Link from '@mui/material/Link'
import Typography from '@mui/material/Typography'
import React, { useState } from 'react'

import { ICrawlingKnowledge } from '@/features/shortcuts/utils/searchEngineCrawling'
import { useCustomTheme } from '@/hooks/useCustomTheme'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const KnowledgePanelContent = React.memo(
  ({ knowledgeSources }: { knowledgeSources: ICrawlingKnowledge }) => {
    const { isDarkMode } = useCustomTheme()
    const [expanded, setExpanded] = useState(false)

    const handleToggle = () => {
      setExpanded(!expanded)
    }

    return (
      <Card
        variant='outlined'
        sx={{
          border: '1px solid rgba(255, 255, 255, 0.16)',
          borderRadius: '8px',
          padding: '8px',
          width: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Box display='flex' alignItems='center' mb={2}>
          <img
            src={
              knowledgeSources.titleImgSrc?.includes('File')
                ? getChromeExtensionAssetsURL(
                    '/images/common/knowledgeImg-empty.png',
                  )
                : knowledgeSources.titleImgSrc
            }
            alt='Logo'
            style={{
              width: 40,
              height: 40,
              borderRadius: '8px',
              marginRight: '8px',
            }}
          />
          <Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 600,
                lineHeight: '150%',
              }}
              component='div'
            >
              {knowledgeSources.title}
            </Typography>
            <Typography variant='body2' color='textSecondary'>
              {knowledgeSources.titleDescription}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            maxHeight: expanded ? '1000px' : '116px',
            // transition: 'all ease 1s',
            overflow: 'hidden',
          }}
        >
          {knowledgeSources?.knowledgePandelList &&
            knowledgeSources?.knowledgePandelList.map((item) => (
              <Box
                key={item.title}
                mb={1}
                sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}
              >
                <Typography variant='body2'>
                  <strong>{item.title}</strong>
                </Typography>
                {item.content &&
                  item.content.map((contentItem, index) => (
                    <React.Fragment key={index}>
                      {contentItem.type === 'a' ? (
                        <Link
                          target={'_blank'}
                          href={contentItem.href}
                          sx={{
                            color: 'text.primary',
                            textDecorationColor: isDarkMode ? 'white' : 'black',
                          }}
                        >
                          {contentItem.text}
                        </Link>
                      ) : (
                        <Typography>{contentItem.text}</Typography>
                      )}
                    </React.Fragment>
                  ))}
              </Box>
            ))}
        </Box>

        <Box
          sx={{
            width: '100%',
            height: 29,
            border: 'none',
            display: 'flex',
            justifyContent: 'flex-start',
          }}
        >
          <Button
            onClick={handleToggle}
            sx={{
              paddingLeft: 0,
              [':hover']: {
                backgroundColor: 'transparent',
              },
            }}
          >
            {expanded ? 'Hide' : 'Show all'}
            {expanded ? (
              <ExpandLessIcon></ExpandLessIcon>
            ) : (
              <ExpandMoreIcon></ExpandMoreIcon>
            )}
          </Button>
        </Box>
      </Card>
    )
  },
)

KnowledgePanelContent.displayName = 'KnowledgePanelContent'

export default KnowledgePanelContent
