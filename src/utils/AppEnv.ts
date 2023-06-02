export const getEnv = () => {
  const host = window.location.host
  if (host === 'mail.google.com') {
    return 'gmail'
  }
  return 'normal'
}
