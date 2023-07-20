export interface ClaudeConversation {
  created_at: string
  name: string
  summary: string
  updated_at: string
  uuid: string
}
// Add Files (5 max, 10MB each) Accepts pdf, txt, csv, etc.
export interface ClaudeAttachment {
  id?: string
  extracted_content: string
  file_name: string
  file_size: number
  file_type: 'pdf' | 'txt' | 'csv'
  totalPages: number
}
