import { IAIProviderModel } from '@/features/chatgpt/types'

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
// completion:" Hello"
// log_id:"3ad646e0b6454bd1c4eb2cc14f8e300d4043001cf7839ac608fed32a2fa02604"
// messageLimit:{type: 'within_limit'}
// model:"claude-2.0"
// stop:null
// stop_reason:null
export interface ClaudeMessage {
  completion: string
  log_id: string
  messageLimit: {
    type: 'within_limit'
  }
  model: string
  stop: boolean | null
  stop_reason: string | null
  error?: {
    type: string
    message: string
  }
}

export const CLAUDE_MODELS: IAIProviderModel[] = [
  {
    title: 'claude-2-100k',
    titleTag: '',
    value: 'claude-2.1',
    maxTokens: 100 * 1000,
    tags: [],
    poweredBy: 'Anthropic',
    description: (t) =>
      t('client:provider__claude_web_app__model__claude_2_100k__description'),
    uploadFileConfig: {
      accept:
        '.pdf,.doc,.docx,.rtf,.epub,.odt,.odp,.pptx,.txt,.py,.ipynb,.js,.jsx,.html,.css,.java,.cs,.php,.c,.cpp,.cxx,.h,.hpp,.rs,.R,.Rmd,.swift,.go,.rb,.kt,.kts,.ts,.tsx,.m,.scala,.rs,.dart,.lua,.pl,.pm,.t,.sh,.bash,.zsh,.csv,.log,.ini,.config,.json,.yaml,.yml,.toml,.lua,.sql,.bat,.md,.coffee',
      acceptTooltip: (t) =>
        t('client:provider__claude_web_app__upload__accept_tooltip'),
      maxFileSize: 10 * 1024 * 1024,
      maxCount: 5,
    },
  },
]
