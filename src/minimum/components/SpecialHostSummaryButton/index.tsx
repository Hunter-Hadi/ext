import React, { FC, useState } from 'react'
import GmailSummaryButton from '@/minimum/components/SpecialHostSummaryButton/GmailSummaryButton'
import YouTubeSummaryButton from '@/minimum/components/SpecialHostSummaryButton/YouTubeSummaryButton'
import {
  getCurrentDomainHost,
  isMaxAIPDFPage,
} from '@/utils/dataHelper/websiteHelper'
import PDFSummaryButton from '@/minimum/components/SpecialHostSummaryButton/PDFSummaryButton'
import OutlookSummaryButton from '@/minimum/components/SpecialHostSummaryButton/OutlookSummaryButton'
import { useRecoilValue } from 'recoil'
import { AppDBStorageState } from '@/store'

const SpecialHostSummaryButton: FC = () => {
  const { userSettings } = useRecoilValue(AppDBStorageState)
  const [appHost] = useState(getCurrentDomainHost)
  return (
    <>
      {userSettings?.summarizeButton?.gmail &&
        appHost === 'mail.google.com' && <GmailSummaryButton />}
      {userSettings?.summarizeButton?.youtube && appHost === 'youtube.com' && (
        <YouTubeSummaryButton />
      )}
      {userSettings?.summarizeButton?.pdf && isMaxAIPDFPage() && (
        <PDFSummaryButton />
      )}
      {userSettings?.summarizeButton?.outlook &&
        (appHost === 'outlook.live.com' ||
          appHost === 'outlook.office.com' ||
          appHost === 'outlook.office365.com') && <OutlookSummaryButton />}
    </>
  )
}
export default SpecialHostSummaryButton
