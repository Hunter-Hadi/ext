type ActionIdentifier =
  | WebGPTActionIdentifier
  | 'RENDER_CHATGPT_PROMPT'
  | 'ASK_CHATGPT'
  | 'GMAIL_INSERT_REPLY_BOX'
  | 'INSERT_USER_INPUT'
  | 'GET_CONTENTS_OF_WEBPAGE'
  | 'SET_VARIABLE'
  | 'URL'
  | 'GET_CONTENTS_OF_URL'
  | 'GET_CONTENTS_OF_SEARCH_ENGINE'
  | 'DATE'
  | 'DATE_FORMAT'
  | 'SUMMARIZE_OF_TEXT'
  | 'SLICE_OF_TEXT'
  | 'FETCH_ACTIONS'
  | 'GET_YOUTUBE_TRANSCRIPT_OF_URL'
  | 'GET_PDF_CONTENTS_OF_CRX'

// webgpt action identifiers
type WebGPTActionIdentifier =
  | 'WEBGPT_SEARCH_RESULTS_EXPAND'
  | 'WEBGPT_ASK_CHATGPT'

export default ActionIdentifier
