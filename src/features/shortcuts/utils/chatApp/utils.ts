export const findLongestCommonSubstring = (str1: string, str2: string) => {
  if (str1.length === 0 || str2.length === 0) return ''

  let maxLength = 0 // 最长共同子串的长度
  let end = 0 // 最长共同子串结束的位置
  // 创建一个二维数组来保存共同子串的长度
  const lengths = Array.from({ length: str1.length + 1 }, () =>
    Array(str2.length + 1).fill(0),
  )

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      // 当发现两个字符串中有相同的字符时
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        lengths[i][j] = lengths[i - 1][j - 1] + 1
        // 更新最长共同子串的长度和结束位置
        if (lengths[i][j] > maxLength) {
          maxLength = lengths[i][j]
          end = i
        }
      }
    }
  }

  // 截取最长共同子串
  return str1.substring(end - maxLength, end).trim()
}
