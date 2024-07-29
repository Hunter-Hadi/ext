// export const APP_AES_ENCRYPTION_KEY = 'ad6e9bb5-b486-4a36-a5b1-4a952701d0c4'
// export const APP_SM3_HASH_KEY = 'eda11778-75b1-49be-8b06-206cd14d3a4c'
import fs from 'fs'

const updateProjectAPISecurityKey = async (appVersion, filePath) => {
  try {
    const result = await fetch(
      'https://test.maxai.me/internal/get_app_encrypt_key_and_hash_key_by_version',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_version: appVersion,
          token:
            'a63b81ddbc808b4e95fe0bb818320fdffb898c80178b5517181f703f0d533f02',
        }),
      },
    )
    const response = await result.json()
    if (response.status === 'OK') {
      const { aes_key, sign_key } = response.data
      const fileContent = `export const APP_AES_ENCRYPTION_KEY =
  '${aes_key}'
export const APP_SM3_HASH_KEY =
  '${sign_key}'
`
      if (filePath) {
        fs.writeFileSync(filePath, fileContent, 'utf8')
      }
      console.log(`V[${appVersion}] API security key updated: \n`, fileContent)
      return { aes_key, sign_key }
    } else {
      console.error(`V[${appVersion}] API security key update failed`)
    }
    return null
  } catch (e) {
    console.error(`V[${appVersion}] API security key update failed`, e)
    return null
  }
}

export default updateProjectAPISecurityKey
