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

// webgpt action identifiers
type WebGPTActionIdentifier = 'WEBGPT_SEARCH_RESULTS_EXPAND'

export default ActionIdentifier
