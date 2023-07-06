const descriptionJson = `
{
  "en": "The fastest way to use ChatGPT (GPT-4 & Plugins), Bard, Bing AI, and Claude anywhere online. Your AI-powered copilot for the web.",
  "en_GB": "The fastest way to use ChatGPT (GPT-4 & Plugins), Bard, Bing AI, and Claude anywhere online. Your AI-powered copilot for the web.",
  "en_US": "The fastest way to use ChatGPT (GPT-4 & Plugins), Bard, Bing AI, and Claude anywhere online. Your AI-powered copilot for the web.",
  "zh_CN": "最快方式在任何网页上使用 ChatGPT（GPT-4 和插件）、Bard、Bing AI 和 Claude。您的网络 AI 助手。",
  "zh_TW": "最快方式在任何網頁上使用 ChatGPT（GPT-4 和插件）、Bard、Bing AI 和 Claude。您的網絡 AI 助手。",
  "am": "በቀጥታ የ ChatGPT (GPT-4 & ስርዓትዎን)፣ Bard፣ Bing AI፣ እና Claude እንዲሁም የአንድነት ጥቅም ላይ በቀላሉ በጣም መጠቀም ያለው የ AI-መቃረቢያው ነው።",
  "ar": "أسرع طريقة لاستخدام ChatGPT (GPT-4 والمكونات الإضافية) و Bard و Bing AI و Claude في أي مكان على الإنترنت. مساعدك المشغّل بالذكاء الاصطناعي على الويب.",
  "bg": "Най-бързият начин за използване на ChatGPT (GPT-4 и разширения), Bard, Bing AI и Claude навсякъде онлайн. Вашият съпътстващ AI за уеба.",
  "bn": "চ্যাটজিপিটি (জিপিটি-৪ এবং প্লাগইন) বার্ড, বিং এআই এবং ক্লোড ব্যবহারের সর্বত্তপর পথ। ওয়েবের জন্য আপনার এআই-প্রযুক্ত সহকারী।",
  "ca": "La forma més ràpida d'utilitzar ChatGPT (GPT-4 & Plugins), Bard, Bing AI i Claude a qualsevol lloc en línia. El teu copilot alimentat per IA per a la web.",
  "cs": "Nejrychlejší způsob, jak používat ChatGPT (GPT-4 a doplňky), Bard, Bing AI a Claude kdekoli online. Váš AI-ový spolujezdec pro web.",
  "da": "Den hurtigste måde at bruge ChatGPT (GPT-4 og Plugins), Bard, Bing AI og Claude hvor som helst online. Din AI-drevne medkører til nettet.",
  "de": "Der schnellste Weg, ChatGPT (GPT-4 & Plugins), Bard, Bing AI und Claude überall online zu verwenden. Dein KI-gesteuerter Co-Pilot für das Web.",
  "el": "Ο γρηγορότερος τρόπος για να χρησιμοποιήσετε το ChatGPT (GPT-4 & Plugins), τον Bard, το Bing AI και τον Claude οπουδήποτε online. Ο AI-ενισχυμένος συνοδηγός σας για το web.",
  "es": "La forma más rápida de usar ChatGPT (GPT-4 y complementos), Bard, Bing AI y Claude en cualquier lugar en línea. Tu copiloto impulsado por IA para la web.",
  "es_419": "La forma más rápida de usar ChatGPT (GPT-4 y complementos), Bard, Bing AI y Claude en cualquier lugar en línea. Tu copiloto con IA para la web.",
  "et": "Kiireim viis kasutada ChatGPT-d (GPT-4 ja lisandmoodulid), Bard, Bing AI ja Claude'i kõikjal veebis. Sinu AI-toega kaassõitja veebis.",
  "fa": "سریع‌ترین روش برای استفاده از ChatGPT (GPT-4 و پلاگین ها)، Bard، Bing AI و Claude در هر مکانی در آنلاین. همراه هوش مصنوعی شما برای وب.",
  "fi": "Nopein tapa käyttää ChatGPT:ää (GPT-4 ja lisäosat), Bard, Bing AI ja Claudea missä tahansa verkossa. Sinun AI-avusteinen tukikumppanisi webiin.",
  "fil": "Ang pinakamabilis na paraan upang gamitin ang ChatGPT (GPT-4 & Mga Plugin), Bard, Bing AI, at Claude kahit saan online. Ang AI-powered copilot mo para sa web.",
  "fr": "La façon la plus rapide d'utiliser ChatGPT (GPT-4 et Plugins), Bard, Bing AI et Claude partout en ligne. Votre copilote alimenté par l'IA pour le web.",
  "gu": "ChatGPT (GPT-4 & પ્લગિનો) નો વપરાશ કરવાની સૌથી ઝડપી રીત. ઓનલાઇન કોઈપણ સ્થાને. તમારો AI-પર આધારિત સહયોગી વેબ માટે.",
  "he": "הדרך המהירה ביותר להשתמש ב-ChatGPT (GPT-4 ותוספות), Bard, Bing AI ו-Claude בכל מקום באינטרנט. העוזר המופעל על ידי AI שלך לרשת.",
  "hi": "वेब पर कहीं भी ChatGPT (GPT-4 और प्लगइन), Bard, Bing AI और Claude का उपयोग करने का सबसे तेज़ तरीका. वेब के लिए आपका AI-संचालित सहयोगी।",
  "hr": "Najbrži način korištenja ChatGPT-a (GPT-4 i dodataka), Bard, Bing AI i Claudea bilo gdje online. Vaš AI-pokretani suvozač za web.",
  "hu": "A leghatékonyabb módja annak, hogy bárhol online használja a ChatGPT-t (GPT-4 és bővítmények), Bard, Bing AI és Claude. Az AI által hajtott együttműködő társ az interneten.",
  "id": "Cara tercepat untuk menggunakan ChatGPT (GPT-4 & Plugin), Bard, Bing AI, dan Claude di mana saja secara online. Copilot berbasis AI Anda untuk web.",
  "it": "Il modo più veloce per utilizzare ChatGPT (GPT-4 e plugin), Bard, Bing AI e Claude ovunque online. Il tuo copilota alimentato da intelligenza artificiale per il web.",
  "ja": "ChatGPT（GPT-4＆プラグイン）、Bard、Bing AI、Claudeをオンラインのどこでも最速で使用する方法。Web用のAIパワードコパイロット。",
  "kn": "ChatGPT (GPT-4 ಮತ್ತು ಪ್ಲಗಿನ್‌ಗಳು), Bard, Bing AI ಮತ್ತು Claude ಅನ್ನು ಯಾವುದೇ ಆನ್ಲೈನ್ ಸ್ಥಳದಲ್ಲಅನ್ಯತ್ರ ವೇಬ್ ನಲ್ಲಿ ChatGPT (GPT-4 & ಪ್ಲಗಿನ್‌ಗಳು), ಬಾರ್ಡ್, ಬಿಂಗ್ AI ಮತ್ತು ಕ್ಲೌಡ್ ಬಳಸುವ ಅತ್ಯಂತ ವೇಗವಾದ ಮಾರ್ಗ. ನಿಮ್ಮ ವೇಬ್ ಗೆ ವಿದ್ಯುತ್‌ಶಕ್ತಿ ಪೂರ್ಣ ಸಹಾಯಕ ಆರೋಪಿತ ಮಿತ್ರ.",
  "ko": "ChatGPT(GPT-4 및 플러그인), Bard, Bing AI 및 Claude를 온라인 어디서나 사용할 수 있는 가장 빠른 방법입니다. 웹용 AI 동반자입니다.",
  "lt": "Greičiausias būdas naudoti ChatGPT (GPT-4 ir įskiepius), Bard, Bing AI ir Claude bet kur internete. Jūsų AI varomas bendravimo partneris internete.",
  "lv": "Ātrākais veids, kā izmantot ChatGPT (GPT-4 un spraudņus), Bard, Bing AI un Claude jebkur vietā tiešsaistē. Jūsu webā darbināmais AI kopilots.",
  "ml": "വെബ്‌സിറ്റിൽ എങ്ങനെയൊക്കെയുള്ളിലേക്കും ChatGPT (GPT-4 & പ്ലഗിൻ‌സ്), ബാർഡ്, ബിംഗ് AI, ക്ലോഡ് ഉപയോഗിക്കാൻ വേഗം. നിങ്ങളുടെ AI-പ്രവർത്തിക്കുന്ന വെബ്ബ് യാന്ത്രികൾ.",
  "mr": "वेब वर कोठेही ChatGPT (GPT-4 आणि प्लग-इन), Bard, Bing AI आणि Claude वापरण्याचा सर्वात वेगवान मार्ग. वेबसाठी तुमचAI-संचालित सहाय्यक.",
  "ms": "Cara terpantas untuk menggunakan ChatGPT (GPT-4 & Plugin), Bard, Bing AI, dan Claude di mana-mana dalam talian. Copilot AI anda untuk web.",
  "nl": "De snelste manier om ChatGPT (GPT-4 & Plugins), Bard, Bing AI en Claude overal online te gebruiken. Uw AI-aangedreven copiloot voor het web.",
  "no": "Den raskeste måten å bruke ChatGPT (GPT-4 og tillegg) på, Bard, Bing AI og Claude hvor som helst online. Din AI-drevne medpilot for weben.",
  "pl": "Najszybszy sposób na korzystanie z ChatGPT (GPT-4 i wtyczek), Bard, Bing AI i Claude w dowolnym miejscu online. Twój wspomagający działania copilot dla sieci.",
  "pt_BR": "A maneira mais rápida de usar o ChatGPT (GPT-4 e Plugins), Bard, Bing AI e Claude em qualquer lugar online. Seu copiloto alimentado por IA para a web.",
  "pt_PT": "A forma mais rápida de utilizar o ChatGPT (GPT-4 e Plugins), Bard, Bing AI e Claude em qualquer lugar online. O seu copiloto alimentado por IA para a web.",
  "ro": "Cel mai rapid mod de a utiliza ChatGPT (GPT-4 și plugin-uri), Bard, Bing AI și Claude oriunde online. Copilotul tău alimentat de IA pentru web.",
  "ru": "Самый быстрый способ использовать ChatGPT (GPT-4 и плагины), Bard, Bing AI и Claude в любом месте онлайн. Ваш AI-сопилот для веба.",
  "sk": "Najrýchlejší spôsob, ako používať ChatGPT (GPT-4 a pluginy), Bard, Bing AI a Claude kdekoľvek online. Váš AI-riadený spolujazdec pre web.",
  "sl": "Najhitrejši način uporabe ChatGPT (GPT-4 in vtičnikov), Bard, Bing AI in Claude kjerkoli na spletu. Vaš AI-gonilnik za splet.",
  "sr": "Најбржи начин да користите ChatGPT (GPT-4 и прикључке), Bard, Bing AI и Claude било где на мрежи. Ваш AI-покретни сувозач за веб.",
  "sv": "Det snabbaste sättet att använda ChatGPT (GPT-4 och tillägg), Bard, Bing AI och Claude var som helst online. Din AI-drivna copilot för webben.",
  "sw": "Njia ya haraka zaidi ya kutumia ChatGPT (GPT-4 & Plugins), Bard, Bing AI, na Claude popote mtandaoni. Msaidizi wako wa AI ulio na nguvu kwa wavuti.",
  "ta": "இணையத்தில் எங்கோயபெடி உள்ள ChatGPT (GPT-4 & மொழிபெயர்ப்புகள்), பார்ட், பிங் AI மற்றும் கிளோட் பயன்படுத்த வேண்டிய விரைவான வழி. உங்கள் AI விசாரிக்கப்படும் வலிமையுடன் வலியுறுத்தப்பட்ட உங்கள் இணையதள உதவி.",
  "te": "యాంకస్ చేసే ChatGPT (GPT-4 & Plugins), Bard, Bing AI, మరియు Claude ఎక్కువసేనా ఆన్లైన్ ఎక్కువవని ఉపయోగించే వేరే మార్గం. మీ AI పై ఆధారితంగా పని చేసే మీ AI-పవర్డ్ కోపిలోట్ వెబ్ కోసం.",
  "th": "วิธีที่เร็วที่สุดในการใช้ ChatGPT (GPT-4 & ปลั๊กอิน), Bard, Bing AI และ Claude ที่ใดก็ได้ที่ออนไลน์ เป็นเพื่อนร่วมเดินทางที่เปิดใช้งานด้วย AI สำหรับเว็บ",
  "tr": "ChatGPT (GPT-4 & Eklentiler), Bard, Bing AI ve Claude'ı çevrimiçi herhangi bir yerde kullanmanın en hızlı yolu. Web için AI destekli yardımcınız.",
  "uk": "Найшвидший спосіб використовувати ChatGPT (GPT-4 і плагіни), Bard, Bing AI та Claude будь-де онлайн. Ваш AI-придаток для вебу.",
  "vi": "Cách nhanh nhất để sử dụng ChatGPT (GPT-4 & Plugins), Bard, Bing AI và Claude bất kỳ nơi nào trực tuyến.Trợ lý hỗ trợ AI của bạn trên web.",
  "he_IL": "הדרך המהירה ביותר להשתמש ב-ChatGPT (GPT-4 & Plugins), Bard, Bing AI ו-Claude בכל מקום באינטרנט. העוזר המופעל על ידי AI שלך לרשת.",
  "in": "Cara tercepat untuk menggunakan ChatGPT (GPT-4 & Plugins), Bard, Bing AI, dan Claude di mana saja secara online. Copilot AI Anda untuk web.",
  "ua": "Найшвидший спосіб використовувати ChatGPT (GPT-4 та плагіни), Bard, Bing AI та Claude будь-де онлайн. Ваш AI-придаток для вебу."
}
`

const EMPTY_DATA = {
  description: '',
  name: '',
  shortName: '',
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs')
const folder = path.join(__dirname, 'src/i18n')
const updateI18nJson = (jsonSources, updateFn) => {
  // get folder lang folders
  const langFolders = fs
    .readdirSync(folder)
    .filter((file) => !file.startsWith('.'))
  const jsonSourceData = JSON.parse(jsonSources)
  const keys = Object.keys(jsonSourceData)
  if (keys.length < langFolders.length) {
    langFolders
      .filter((lang) => !keys.includes(lang))
      .forEach((lang) => {
        console.log('need update description', lang)
      })
    throw new Error(
      'need update description, cause langFolders.length !== keys.length',
    )
  }
  console.log('need update lang', keys.length)
  keys.forEach((key) => {
    const value = jsonSourceData[key]
    // create no exist folder
    if (!fs.existsSync(path.join(folder, key))) {
      fs.mkdirSync(path.join(folder, key))
      // create default messages.json
      fs.writeFileSync(
        path.join(folder, `${key}/index.json`),
        JSON.stringify(EMPTY_DATA, null, 2),
        'utf-8',
      )
    }
    const filePath = path.join(folder, `${key}/index.json`)
    let jsonData = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    jsonData = updateFn(value, jsonData)
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf-8')
  })
  console.log('update description success')
}

updateI18nJson(descriptionJson, (updateText, jsonData) => {
  return {
    ...jsonData,
    description: updateText,
  }
})

// prompt
const sendPrompt = `
I need you to help me complete my i18n JSON text with the sentence "[Doc]"
If you understand, I will send you the JSON text for you to update with the following conditions:
1. The structure cannot be changed.
2. The semantics cannot be changed.
3. The JSON I sent you must be fully filled in
`
const emptyPrompt = `
{
"en":"",
"en_GB":"",
"en_US":"",
"zh_CN":"",
"zh_TW":"",
"am":"",
"ar":"",
"bg":"",
"bn":"",
"ca":"",
"cs":"",
"da":"",
"de":"",
"el":"",
"es":"",
"es_419":"",
"et":"",
"fa":"",
"fi":"",
"fil":"",
"fr":"",
"gu":"",
"he":"",
"hi":"",
"hr":"",
"hu":"",
"id":"",
"it":"",
"ja":"",
"kn":"",
"ko":"",
"lt":"",
"lv":"",
"ml":"",
"mr":"",
"ms":"",
"nl":"",
"no":"",
"pl":"",
"pt_BR":"",
"pt_PT":"",
"ro":"",
"ru":"",
"sk":"",
"sl":"",
"sr":"",
"sv":"",
"sw":"",
"ta":"",
"te":"",
"th":"",
"tr":"",
"uk":"",
"vi":"",
"he_IL":"",
"in":"",
"ua":""
}
`
