import React, { FC } from 'react'
import SettingsFeatureCardLayout from '@/pages/settings/layout/SettingsFeatureCardLayout'
import { useTranslation } from 'react-i18next'
import List from '@mui/material/List'
import { ListItem } from '@mui/material'
import ListItemText from '@mui/material/ListItemText'
import { useUserSettings } from '@/pages/settings/hooks/useUserSettings'
import LanguageCodeSelect from '@/components/select/LanguageCodeSelect'
import { useContextMenuList } from '@/features/contextMenu'
import {
  ContextMenuSearchTextStore,
  removeContextMenuSearchTextStore,
  setContextMenuSearchTextStore,
} from '@/features/sidebar/store/contextMenuSearchTextStore'

const FeaturePreferredLanguageCard: FC = () => {
  const { userSettings, setUserSettings } = useUserSettings()
  const { t } = useTranslation(['settings', 'common', 'prompt'])
  const { originContextMenuList } = useContextMenuList('textSelectPopupButton')

  const handleUpdateContextMenuI18nCache = async (language: string) => {
    if (language && originContextMenuList.length > 0) {
      const searchTextPrefixMap: ContextMenuSearchTextStore = {
        en: {} as any,
        [language]: {} as any,
      }
      const saveSearchTextData: ContextMenuSearchTextStore = {
        en: {} as any,
        [language]: {} as any,
      }
      const findSearchText = (parent: string) => {
        const children = originContextMenuList.filter(
          (item) => item.parent === parent,
        )
        if (children.length === 0) {
          return
        }
        children.forEach((item) => {
          // 拼接parent的前缀
          const enPrefix = searchTextPrefixMap['en'][parent] || ''
          const currentLanguagePrefix =
            searchTextPrefixMap[language][parent] || ''
          // 当前的text
          const enItemText = item.text
          let currentLanguageItemText = enItemText
          // 只拼接一层
          const enSearchText = `${enPrefix} ${item.text}`.trimStart()
          let currentLanguageSearchText = enSearchText
          if (language !== 'en' && t(`prompt:${item.id}` as any) !== item.id) {
            currentLanguageItemText = t(`prompt:${item.id}` as any)
            currentLanguageSearchText =
              `${currentLanguagePrefix} ${currentLanguageItemText} ${enSearchText}`.trimStart()
          }
          searchTextPrefixMap.en[item.id] = enItemText.toLowerCase()
          searchTextPrefixMap[language][item.id] =
            currentLanguageItemText.toLowerCase()
          saveSearchTextData.en[item.id] = enSearchText.toLowerCase()
          saveSearchTextData[language][item.id] =
            currentLanguageSearchText.toLowerCase()
          findSearchText(item.id)
        })
      }
      findSearchText('root')
      debugger
      await removeContextMenuSearchTextStore('en')
      await removeContextMenuSearchTextStore(language)
      await setContextMenuSearchTextStore('en', saveSearchTextData.en)
      await setContextMenuSearchTextStore(
        language,
        saveSearchTextData[language],
      )
    }
  }
  return (
    <SettingsFeatureCardLayout
      title={t('settings:feature_card__preferred_language__title')}
      id={'ai-response-language'}
    >
      <List
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgb(32, 33, 36)'
              : 'rgb(255,255,255)',
          p: '0 !important',
          borderRadius: '4px',
          border: (t) =>
            t.palette.mode === 'dark'
              ? '1px solid rgba(255, 255, 255, 0.12)'
              : '1px solid rgba(0, 0, 0, 0.12)',
        }}
      >
        <ListItem>
          <ListItemText
            primary={t(
              'settings:feature_card__preferred_language__field_preferred_language_title',
            )}
            secondary={t(
              'settings:feature_card__preferred_language__field_preferred_language_description',
            )}
          />
          {userSettings && (
            <LanguageCodeSelect
              sx={{ flexShrink: 0, width: 220, ml: 2 }}
              label={t(
                'settings:feature_card__preferred_language__field_preferred_language_label',
              )}
              defaultValue={userSettings.preferredLanguage}
              onChange={async (newLanguage) => {
                await setUserSettings({
                  ...userSettings,
                  preferredLanguage: newLanguage,
                })
                await handleUpdateContextMenuI18nCache(newLanguage)
              }}
            />
          )}
        </ListItem>
      </List>
    </SettingsFeatureCardLayout>
  )
}
export default FeaturePreferredLanguageCard
