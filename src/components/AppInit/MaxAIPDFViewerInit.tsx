import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { styled } from '@mui/material/styles'
import Switch from '@mui/material/Switch'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Browser from 'webextension-polyfill'

import { UseChatGptIcon } from '@/components/CustomIcon'
import DynamicComponent from '@/components/DynamicComponent'
import useEffectOnce from '@/features/common/hooks/useEffectOnce'
import useInterval from '@/features/common/hooks/useInterval'
import { chromeExtensionClientOpenPage } from '@/utils'
import { isMaxAIPDFPage } from '@/utils/dataHelper/websiteHelper'
import { getChromeExtensionAssetsURL } from '@/utils/imageHelper'

const MAXAIPDFAIViewerErrorAlert: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const [show, setShow] = useState(false)
  const [delay, setDelay] = useState<number | null>(100)
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = (event: any) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragOver = (event: any) => {
    event.preventDefault()
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (event: any) => {
    event.preventDefault()
    setIsDragOver(false)

    const files = event.dataTransfer.files as FileList
    // 处理拖放的文件
    console.log(files)
    const dropPDFFile = Array.from(files).find((file) => {
      return file.type === 'application/pdf' || file.name.endsWith('.pdf')
    })
    if (dropPDFFile) {
      const pdfLib = (window as any).PDFViewerApplication
      // open pdf file
      if (pdfLib) {
        pdfLib.open({
          url: URL.createObjectURL(dropPDFFile),
          originalUrl: dropPDFFile.name,
        })
      }
    }
  }

  useInterval(() => {
    const root = document.body.querySelector(
      '#usechatgptPDFViewerErrorAlert',
    ) as HTMLElement
    if (root) {
      root.style.top = '120px'
      root.style.left = '50%'
      root.style.transform = 'translateX(-50%)'
      root.style.zIndex = 'unset'
      console.log('PDFViewerError', delay)
      setDelay(null)
      setRootElement(root as HTMLElement)
      setShow(true)
      return
    }
  }, delay)
  if (!show || !rootElement) {
    return null
  }
  return (
    <DynamicComponent
      rootContainer={rootElement}
      customElementName={'maxai-pdf-ai-viewer-error-alert'}
    >
      <Stack
        gap={4}
        width={'90vw'}
        maxWidth={'1088px'}
        sx={{
          boxSizing: 'border-box',
        }}
      >
        <Stack
          direction={'row'}
          alignItems={'center'}
          gap={1}
          justifyContent={'center'}
        >
          <UseChatGptIcon sx={{ fontSize: '24px' }} />
          <Typography fontSize={'28px'} color={'rgba(255,255,255,.87)'}>
            MaxAI.me
          </Typography>
        </Stack>
        <Typography
          textAlign={'center'}
          fontSize={'40px'}
          fontWeight={700}
          color={'rgba(255,255,255,.87)'}
        >
          {t('client:pdf_ai_viewer__file_picker__title')}
        </Typography>
        <Typography
          textAlign={'center'}
          fontSize={'18px'}
          fontWeight={400}
          color={'rgba(255,255,255,.87)'}
        >
          {t('client:pdf_ai_viewer__file_picker__description')}
        </Typography>
        <Stack
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          width={'100%'}
          height={300}
          justifyContent={'center'}
          alignItems={'center'}
          gap={2}
          sx={{
            borderRadius: '8px',
            padding: isDragOver ? '0' : '1px',
            border: isDragOver ? '2px dashed' : '1px dashed',
            borderColor: 'primary.main',
            bgcolor: 'rgba(244,235,251,1)',
            // background:
            //   'linear-gradient(0deg, rgba(118, 1, 211, 0.08) 0%, rgba(118, 1, 211, 0.08) 100%), #FFF;',
          }}
        >
          <img
            width={64}
            height={64}
            src={getChromeExtensionAssetsURL('/images/pdf/pdf-icon.png')}
            alt={'pdf-icon'}
          />
          <Box
            sx={{
              borderRadius: '8px',
              bgcolor: 'background.paper',
            }}
          >
            <Button
              onClick={(event) => {
                event.stopPropagation()
                ;(document.querySelector(
                  '#openFile',
                ) as HTMLButtonElement)?.click()
              }}
              variant={'contained'}
              sx={{
                position: 'relative',
                width: '320px',
                gap: 1,
                px: 4,
                py: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(255,255,255,.87)',
              }}
            >
              <NoteAddOutlinedIcon
                sx={{
                  fontSize: '24px',
                  color: 'inherit',
                }}
              />
              <Typography fontSize={'16px'} fontWeight={600}>
                {t('client:pdf_ai_viewer__file_picker__button__title')}
              </Typography>
              <Typography
                fontSize={'14px'}
                fontWeight={400}
                color={'rgba(0,0,0,.6)'}
                sx={{
                  position: 'absolute',
                  bottom: -24,
                }}
              >
                {t('client:pdf_ai_viewer__file_picker__button__description')}
              </Typography>
            </Button>
          </Box>
        </Stack>
      </Stack>
    </DynamicComponent>
  )
}

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: 12,
    padding: '16px',
    boxShadow: theme.shadows[5],
    maxWidth: 'none',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
}))

const MaxAIPDFAIViewerTopBarButtonGroup: FC = () => {
  const { t } = useTranslation(['common', 'client'])
  const [show, setShow] = useState(false)
  const [rootElement, setRootElement] = useState<HTMLElement | null>(null)
  const [isAccessPermission, setIsAccessPermission] = useState(true)
  useEffectOnce(() => {
    if (isMaxAIPDFPage()) {
      Browser.extension.isAllowedFileSchemeAccess().then(setIsAccessPermission)
      const pdfViewerRoot = document.querySelector('#toolbarViewerLeft')
      if (pdfViewerRoot) {
        const div = document.createElement('div')
        div.id = 'MaxAIPDFViewerTopBarButtonGroup'
        div.style.display = 'flex'
        div.style.alignItems = 'center'
        div.style.height = '32px'
        pdfViewerRoot.appendChild(div)
        setRootElement(div)
      }
      setShow(true)
    }
  })
  if (!show || !rootElement) {
    return null
  }
  return (
    <DynamicComponent
      rootContainer={rootElement}
      customElementName={'maxai-pdf-ai-viewer-top-bar-button-group'}
    >
      <Stack direction={'row'} alignItems={'center'} gap={1}>
        <LightTooltip
          PopperProps={{
            sx: {
              zIndex: 99999999,
            },
            container: rootElement,
            disablePortal: true,
          }}
          title={
            <Stack width={320} gap={1}>
              <Typography fontSize={'16px'} fontWeight={700}>
                {t(
                  'client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__tooltip__title',
                )}
              </Typography>
              <Typography fontSize={'14px'} fontWeight={400}>
                {t(
                  'client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__tooltip__description1',
                )}{' '}
                <Link
                  color={'text.primary'}
                  href={'#'}
                  onClick={async (event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    await chromeExtensionClientOpenPage({
                      key: 'options',
                      query: '?id=pdf-viewer#/appearance',
                    })
                  }}
                >
                  {t(
                    'client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__tooltip__description2',
                  )}
                </Link>
                {t(
                  'client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__tooltip__description3',
                )}
              </Typography>
              <img
                style={{ flexShrink: 0, alignSelf: 'center' }}
                width={'100%'}
                src={getChromeExtensionAssetsURL('/images/pdf/guide-2.gif')}
              />
            </Stack>
          }
          placement={'bottom-start'}
          arrow
        >
          <Button
            onClick={async () => {
              await chromeExtensionClientOpenPage({
                key: 'options',
                query: '?id=pdf-viewer#/appearance',
              })
            }}
            sx={{
              fontSize: '14px',
              color: 'rgba(255,255,255,.87)',
              height: 32,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            {t('client:pdf_ai_viewer__toggle_button__pdf_ai_viewer__title')}
            <Switch checked size={'small'} />
          </Button>
        </LightTooltip>
        {!isAccessPermission && (
          <LightTooltip
            PopperProps={{
              sx: {
                zIndex: 99999999,
              },
              container: rootElement,
              disablePortal: true,
            }}
            title={
              <Stack width={320} gap={1}>
                <Typography fontSize={'16px'} fontWeight={700}>
                  {t(
                    'client:pdf_ai_viewer__toggle_button__drag_drop_pdf__tooltip__title',
                  )}
                </Typography>
                <Typography fontSize={'14px'} fontWeight={400}>
                  {t(
                    'client:pdf_ai_viewer__toggle_button__drag_drop_pdf__tooltip__description1',
                  )}{' '}
                  <Link
                    color={'text.primary'}
                    href={'#'}
                    onClick={async (event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      await chromeExtensionClientOpenPage({
                        key: 'manage_extension',
                      })
                    }}
                  >
                    {'chrome://extensions'}
                  </Link>
                  {t(
                    'client:pdf_ai_viewer__toggle_button__drag_drop_pdf__tooltip__description2',
                  )}
                </Typography>
                <img
                  style={{ flexShrink: 0, alignSelf: 'center' }}
                  width={'100%'}
                  src={getChromeExtensionAssetsURL('/images/pdf/guide-2.gif')}
                />
              </Stack>
            }
            placement={'bottom-start'}
            arrow
          >
            <Button
              onClick={async () => {
                await chromeExtensionClientOpenPage({
                  key: 'manage_extension',
                })
              }}
              sx={{
                fontSize: '14px',
                color: 'rgba(255,255,255,.87)',
                height: 32,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              {t('client:pdf_ai_viewer__toggle_button__drag_drop_pdf__title')}
              <Switch checked={isAccessPermission} size={'small'} />
            </Button>
          </LightTooltip>
        )}
      </Stack>
    </DynamicComponent>
  )
}

export { MAXAIPDFAIViewerErrorAlert, MaxAIPDFAIViewerTopBarButtonGroup }
