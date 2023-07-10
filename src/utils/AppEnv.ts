export const getEnv = () => {
  const host = typeof window !== 'undefined' ? window.location.host : ''
  if (host === 'mail.google.com') {
    return 'gmail'
  }
  return 'normal'
}
