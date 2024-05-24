import PDFCitation from '@/features/citation/core/PDFCitation'
import { ICitationService } from '@/features/citation/types'
import { getPageSummaryType } from '@/features/sidebar/utils/pageSummaryHelper'

export default class CitationFactory {
  static maps: Record<string, ICitationService | undefined> = {}

  static getCitationService(type = getPageSummaryType()) {
    switch (type) {
      case 'PDF_CRX_SUMMARY':
        if (!CitationFactory.maps[type]) {
          CitationFactory.maps[type] = new PDFCitation()
        }
        return CitationFactory.maps[type]
    }
  }
}
