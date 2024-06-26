import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import { styled } from '@mui/material/styles'
import React, { memo, useState } from 'react'

import { IAIResponseOriginalMessageSourceMediaImages } from '@/features/indexed_db/conversations/models/Message'

const Img = styled('img')({
  width: 64,
  height: 64,
  borderRadius: 8,
  cursor: 'pointer',
  objectFit: 'cover',
})

const DialogImgContainer = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  maxWidth: '100%',
  maxHeight: '100%',
  width: '100%',
})

const DialogImg = styled('img')({
  borderRadius: 8,
  width: 'auto',
  height: 'auto',
  objectFit: 'cover',
  maxWidth: '100%',
  maxHeight: '98vh',
  minWidth: 100,
})

interface ThumbnailProps {
  selected: boolean
}

const ThumbnailContainer = styled('div')({
  width: 128,
  marginBottom: 8,
  display: 'flex',
  justifyContent: 'center',
  alignSelf: 'start',
  '& img': {
    width: '128px',
    height: 'auto',
    borderRadius: 8,
    boxSizing: 'border-box',
    padding: '2px',
    cursor: 'pointer',
  },
})

const Thumbnail = styled('img', {
  shouldForwardProp: (prop) => prop !== 'selected',
})<ThumbnailProps>(({ theme, selected }) => ({
  outline: selected ? `2px solid ${theme.palette.primary.main}` : 'none',
  boxSizing: 'border-box',
}))

const MemoizedThumbnail = memo(Thumbnail)
const MemoizedThumbnailContainer = memo(ThumbnailContainer)

const ImageWithDialog = ({
  images,
}: {
  images: IAIResponseOriginalMessageSourceMediaImages[]
}) => {
  const [open, setOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState(
    images[0] || { src: '', alt: '' },
  )

  const handleClickOpen = (
    image: IAIResponseOriginalMessageSourceMediaImages,
  ) => {
    setSelectedImage(image)
    setOpen(true)
  }

  const handleClose = () => {
    setOpen(false)
  }

  const handleThumbnailClick = (
    image: IAIResponseOriginalMessageSourceMediaImages,
  ) => {
    setSelectedImage(image)
  }

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.style.display = 'none'
  }

  return (
    <>
      {images.map((image, index) => (
        <Img
          key={index}
          src={image.src}
          alt={image.alt}
          onClick={() => handleClickOpen(image)}
          onError={handleImageError}
        />
      ))}
      <Dialog
        open={open}
        onClose={handleClose}
        fullScreen
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
        slotProps={{
          backdrop: {
            style: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
          },
        }}
      >
        <DialogContent
          sx={{
            overflowX: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            padding: 0,
          }}
          onClick={() => handleClose()}
        >
          <Box display='flex' alignItems='center' height='100%' width='100%'>
            <Box
              flexGrow={1}
              flexShrink={1}
              display='flex'
              justifyContent='center'
              alignItems='center'
              pr={2}
              height='100%'
            >
              <DialogImgContainer>
                <DialogImg
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  onError={handleImageError}
                />
              </DialogImgContainer>
            </Box>
            <Box
              sx={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'row',
                gap: 1,
                flexWrap: 'wrap',
                overflowY: 'auto',
                height: 'calc(100% - 96px)',
                marginRight: '32px', // 保持右侧固定间距
                width: '284px', // 两栏布局，每栏128px
                alignContent: 'flex-start',
                justifyContent: 'flex-start',
                paddingLeft: '2px',
              }}
            >
              {images.map((image, index) => (
                <MemoizedThumbnailContainer key={index}>
                  <MemoizedThumbnail
                    src={image.src}
                    alt={image.alt}
                    selected={selectedImage.src === image.src}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleThumbnailClick(image)
                    }}
                    onError={(e) => {
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.style.display = 'none'
                      }
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </MemoizedThumbnailContainer>
              ))}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ImageWithDialog
