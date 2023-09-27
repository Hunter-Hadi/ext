const ContextMenuNamePrefixList = [
  '[Gmail] ',
  '[Outlook] ',
  '[Twitter] ',
  '[LinkedIn] ',
  '[Facebook] ',
  '[YouTube] ',
] as const
export const ContextMenuNamePrefixRegex = new RegExp(
  ContextMenuNamePrefixList.join('|')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\s/g, '\\s'),
)
export type ContextMenuNamePrefixType = typeof ContextMenuNamePrefixList[number]
