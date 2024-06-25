import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import EmailCitation from '@/features/citation/core/EmailCitation'
import PDFCitation from '@/features/citation/core/PDFCitation'
import { ICitationService } from '@/features/citation/types'

export default class CitationFactory {
  static maps: Record<string, ICitationService | undefined> = {}

  static getCitationService(type = getPageSummaryType()) {
    switch (type) {
      case 'PAGE_SUMMARY':
      case 'YOUTUBE_VIDEO_SUMMARY':
        return undefined
      case 'DEFAULT_EMAIL_SUMMARY':
        return new EmailCitation()
      case 'PDF_CRX_SUMMARY':
        if (!CitationFactory.maps[type]) {
          CitationFactory.maps[type] = new PDFCitation()
        }
        return CitationFactory.maps[type]
    }
  }
}
