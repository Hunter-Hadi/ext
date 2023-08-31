// shortcuts配合运行需要的event
export type IShortCutsSendEvent =
  | 'ShortCuts_getContentOfURL'
  | 'ShortCuts_getContentOfSearchEngine'
  | 'ShortCuts_OperationPageElement'
  | 'ShortCuts_OperationPageElementResponse'

export type IShortCutsClientListenEvent =
  | 'ShortCuts_ClientExecuteOperationPageElement'
