import { getPageSummaryType } from '@/features/chat-base/summary/utils/pageSummaryHelper'
import PageCitation from '@/features/citation/core/PageCitation'
import PDFCitation from '@/features/citation/core/PDFCitation'
import { ICitationService } from '@/features/citation/types'

export default class CitationFactory {
  static maps: Record<string, ICitationService | undefined> = {}

  static getCitationService(
    conversationId?: string,
    type = getPageSummaryType(),
  ) {
    const cacheKey = conversationId ? conversationId : type
    if (CitationFactory.maps[cacheKey]) {
      return CitationFactory.maps[cacheKey]
    }
    switch (type) {
      case 'PAGE_SUMMARY':
        return (CitationFactory.maps[cacheKey] = new PageCitation(
          conversationId,
        ))
      case 'YOUTUBE_VIDEO_SUMMARY':
        return undefined
      case 'DEFAULT_EMAIL_SUMMARY':
        return undefined
      case 'PDF_CRX_SUMMARY':
        return (CitationFactory.maps[cacheKey] = new PDFCitation(
          conversationId,
        ))
    }
  }
}
