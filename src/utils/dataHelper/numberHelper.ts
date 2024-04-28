export const numberFormatter = (number: number, digits = 1) => {
  let isNegativeNumber = false // 是否是负数
  if (number < 0) {
    isNegativeNumber = true
    number = Math.abs(number)
  }
  if (number < 1) {
    return `${isNegativeNumber ? '-' : ''}${number.toFixed(digits)}`
  }
  const lookup = [
    { value: 1, symbol: '' },
    { value: 1e3, symbol: 'K' },
    { value: 1e6, symbol: 'M' },
    { value: 1e9, symbol: 'B' },
  ]
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const item = lookup
    .slice()
    .reverse()
    .find(function (item) {
      return number >= item.value
    })
  return item
    ? (isNegativeNumber ? '-' : '') +
        (number / item.value).toFixed(digits).replace(rx, '$1') +
        item.symbol
    : '0'
}

// 4096 -> 4K
// 100000 -> 1,000K
// 1000000 -> 10,000K
export const numberToTokensText = (number: number) => {
  if (number < 1000) {
    return number
  }
  return numberWithCommas(Math.floor(number / 1000)) + 'K'
}

export const filesizeFormatter = (size: number, digits = 1) => {
  const lookup = [
    { value: 1, symbol: 'B' },
    { value: 1024, symbol: 'KB' },
    { value: 1048576, symbol: 'MB' },
    { value: 1073741824, symbol: 'GB' },
    { value: 1099511627776, symbol: 'TB' },
  ]

  const isNegativeNumber = size < 0
  const absSize = isNegativeNumber ? -size : size

  const item = lookup
    .slice()
    .reverse()
    .find(({ value }) => absSize >= value)

  if (!item) {
    return `${isNegativeNumber ? '-' : ''}${absSize.toFixed(digits)} B`
  }

  const formattedSize = (absSize / item.value).toFixed(digits)
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  const trimmedFormattedSize = formattedSize.replace(rx, '$1')

  return `${isNegativeNumber ? '-' : ''}${trimmedFormattedSize} ${item.symbol}`
}
export const numberWithCommas = (number: number, digits = 2) => {
  return Number(number)
    .toFixed(digits)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const numberDisplayPercent = (percent: number, digits = 2) => {
  if (percent === 0) {
    return '0%'
  }
  if (percent > 1) {
    return `${percent.toFixed(digits)}%`
  }
  return `${(percent * 100).toFixed(digits)}%`
}
