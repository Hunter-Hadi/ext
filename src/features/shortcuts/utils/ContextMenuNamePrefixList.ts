const ContextMenuNamePrefixList = [
  '[Gmail] ',
  '[Outlook] ',
  '[Twitter] ',
  '[LinkedIn] ',
  '[Facebook] ',
  '[YouTube] ',
  '[YouTube Studio] ',
  '[Instagram] ',
] as const
export const ContextMenuNamePrefixRegex = new RegExp(
  ContextMenuNamePrefixList.join('|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\s/g, '\\s'),
)
export type ContextMenuNamePrefixType = typeof ContextMenuNamePrefixList[number]
