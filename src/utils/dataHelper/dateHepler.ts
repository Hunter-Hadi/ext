import dayjs from 'dayjs'

export const date2UTCMidnight = (
  date: Date = new Date(),
  dateFormat = 'YYYY-MM-DD HH:mm:ss',
) => {
  return dayjs(new Date(date).setUTCHours(24, 0, 0, 0)).format(dateFormat)
}
