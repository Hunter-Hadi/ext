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