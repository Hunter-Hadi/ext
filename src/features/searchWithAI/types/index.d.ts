export type IAIForSearchStatus =
  // 初始化状态
  | 'idle'
  // 等待 AI 的回复
  | 'waitingAnswer'
  // AI 正在回复，但是还没有回复完毕
  | 'answering'
  // AI 回复完毕
  | 'success'
  // 报错
  | 'error'
  // 停止
  | 'stop'
