import React, { FC, useState } from 'react'
import GmailSummaryButton from '@/minimum/components/SpecialHostSummaryButton/GmailSummaryButton'
import YouTubeSummaryButton from '@/minimum/components/SpecialHostSummaryButton/YouTubeSummaryButton'
import {
  getCurrentDomainHost,
  isMaxAIPDFPage,
} from '@/utils/dataHelper/websiteHelper'
import PDFSummaryButton from '@/minimum/components/SpecialHostSummaryButton/PDFSummaryButton'
import OutlookSummaryButton from '@/minimum/components/SpecialHostSummaryButton/OutlookSummaryButton'

const SpecialHostSummaryButton: FC = () => {
  const [appHost] = useState(getCurrentDomainHost)
  return (
    <>
      {appHost === 'mail.google.com' && <GmailSummaryButton />}
      {appHost === 'youtube.com' && <YouTubeSummaryButton />}
      {isMaxAIPDFPage() && <PDFSummaryButton />}
      {appHost === 'outlook.live.com' && <OutlookSummaryButton />}
    </>
  )
}
export default SpecialHostSummaryButton
