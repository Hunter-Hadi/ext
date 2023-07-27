const descriptionJson = `
{
  "en": "The fastest way to use ChatGPT, Claude, Bard, Bing anywhere online. Supports GPT-4, Code Interpreter, Web Browsing, Plugins.",
  "en_GB": "The fastest way to use ChatGPT, Claude, Bard, Bing anywhere online. Supports GPT-4, Code Interpreter, Web Browsing, Plugins.",
  "en_US": "The fastest way to use ChatGPT, Claude, Bard, Bing anywhere online. Supports GPT-4, Code Interpreter, Web Browsing, Plugins.",
  "zh_CN": "在任何网页上使用ChatGPT、Claude、Bard、Bing的最快方式。支持GPT-4、代码解释器、网络浏览和插件。",
  "zh_TW": "在任何網頁上使用ChatGPT、Claude、Bard、Bing的最快方式。支援GPT-4、程式碼解譯器、網頁瀏覽和插件。",
  "am": "በወደቀ በግልፅ የChatGPT, Claude, Bard, Bing መጠቀም ውስጥ በግል ተጨማሪ አድራሻዎች ናቸው። የGPT-4, ኮድ መልክትዎን, ድረ-ገጽ, አማራጭራርዎን ያገኛሉ።",
  "ar": "أسرع طريقة لاستخدام ChatGPT و Bard و Bing و Claude على الإنترنت في أي مكان. يدعم GPT-4 ومفسر الشفرة وتصفح الويب والمكونات الإضافية.",
  "bg": "Най-бързият начин да използвате ChatGPT, Claude, Bard, Bing навсякъде онлайн. Поддържа GPT-4, интерпретатор на кода, уеб браузър, добавки.",
  "bn": "ChatGPT, Claude, Bard, Bing যেকোনো অনলাইন স্থানে ব্যবহার করার জন্য সর্বত্র সবচেয়ে দ্রুত উপায়। GPT-4, কোড ইন্টারপ্রেটার, ওয়েব ব্রাউজিং, প্লাগইন সমর্থন করে।",
  "ca": "La forma més ràpida d'utilitzar ChatGPT, Claude, Bard, Bing en qualsevol lloc en línia. Admet GPT-4, intèrpret de codi, navegació web, connectors.",
  "cs": "Nejrychlejší způsob, jak používat ChatGPT, Claude, Bard, Bing kdekoli online. Podporuje GPT-4, interpretační kód, webové prohlížení, pluginy.",
  "da": "Den hurtigste måde at bruge ChatGPT, Claude, Bard, Bing overalt online. Understøtter GPT-4, kodefortolker, webbrowsing, plugins.",
  "de": "Der schnellste Weg, um ChatGPT, Claude, Bard, Bing überall online zu nutzen. Unterstützt GPT-4, Code-Interpreter, Web-Browsing, Plugins.",
  "el": "Ο γρηγορότερος τρόπος για να χρησιμοποιήσετε το ChatGPT, Claude, Bard, Bing οπουδήποτε στο διαδίκτυο. Υποστηρίζει GPT-4, διερμηνέα κώδικα, περιήγηση στον ιστό, πρόσθετα.",
  "es": "La forma más rápida de usar ChatGPT, Claude, Bard, Bing en cualquier lugar en línea. Admite GPT-4, intérprete de código, navegación web, complementos.",
  "es_419": "La forma más rápida de usar ChatGPT, Claude, Bard, Bing en cualquier lugar en línea. Admite GPT-4, intérprete de código, navegación web, complementos.",
  "et": "Kiireim viis kasutada ChatGPT, Claude, Bard, Bing'it kõikjal veebis. Toetab GPT-4, koodi tõlk, veebilehitseja, pistikprogramme.",
  "fa": "سریعترین راه برای استفاده از ChatGPT، Claude، Bard، Bing در هر مکان آنلاین. از GPT-4، تفسیر کد، مرورگر وب، پلاگین ها پشتیبانی می کند.",
  "fi": "Nopein tapa käyttää ChatGPT, Claude, Bard, Binga missä tahansa verkossa. Tukee GPT-4, kooditulkki, verkkoselailu, lisäosat.",
  "fil": "Ang pinakamabilis na paraan upang gamitin ang ChatGPT, Claude, Bard, Bing kahit saan online. Sumusuporta sa GPT-4, Code Interpreter, Web Browsing, Plugins.",
  "fr": "La façon la plus rapide d'utiliser ChatGPT, Claude, Bard, Bing n'importe où en ligne. Prend en charge GPT-4, un interprète de code, la navigation web et les plugins.",
  "gu": "ChatGPT, Claude, Bard, Bing ને ઓનલાઇન ક્યાંક વપરાશ કરવાની સૌથી ઝડપી રીત. GPT-4, કોડ ઇન્ટરપ્રેટર, વેબ બ્રાઉઝિંગ, પ્લગઇનો સમર્થન કરે છે.",
  "he": "הדרך המהירה ביותר להשתמש ב-ChatGPT, Claude, Bard, Bing בכל מקום באינטרנט. תומך ב-GPT-4, מפרש קוד, גלישה ברשת, תוספים.",
  "hi": "ChatGPT, Claude, Bard, Bing का उपयोग करने का सबसे तेज़ तरीका, कहीं भी ऑनलाइन. GPT-4, कोड अनुप्रेत, वेब ब्राउज़िंग, प्लगइन्स का समर्थन करता है।",
  "hr": "Najbrži način korištenja ChatGPT, Claude, Bard, Bing bilo gdje online. Podržava GPT-4, interpreter koda, web pregledavanje, dodatke.",
  "hu": "A leggyorsabb módja a ChatGPT, Claude, Bard, Bing bármely online felhasználásának. Támogatja a GPT-4, a kódértelmezőt, a webböngészést és a bővítményeket.",
  "id": "Cara tercepat untuk menggunakan ChatGPT, Claude, Bard, Bing di mana saja secara online. Mendukung GPT-4, Interpreter Kode, Penjelajahan Web, Plugin.",
  "it": "Il modo più veloce per utilizzare ChatGPT, Claude, Bard, Bing ovunque online. Supporta GPT-4, interprete di codice, navigazione web, plug-in.",
  "ja": "ChatGPT、Claude、Bard、Bing をオンラインでどこでも最速で利用する方法です。GPT-4、コードインタプリタ、Web ブラウジング、プラグインに対応しています。",
  "kn": "ಆನ್‍ಲೈನ್‍ನಲ್ಲಿ ಚಾಟ್‌ಜಿಪಿಟಿ, ಬಾರ್ಡ್‌, ಬಿಂಗ್, ಕ್ಲಾಡ್ ಅನ್ನು ಬಳಸುವ ಅತ್ಯಂತ ವೇಗವಾದ ಮಾರ್ಗ. GPT-4, ಕೋಡ್ ಅನುವಾದಕ, ವೆಬ್ ಬ್ರೌಸಿಂಗ್, ಪ್ಲಗಿನ್‌ಗಳನ್ನು ಬೆಂಬಲಿಸುತ್ತದೆ.",
  "ko": "ChatGPT, Claude, Bard, Bing를 온라인 어디에서나 가장 빠르게 사용하는 방법입니다. GPT-4, 코드 인터프리터, 웹 브라우징, 플러그인을 지원합니다.",
  "lt": "Greičiausias būdas naudoti ChatGPT, Claude, Bard, Bing bet kurioje interneto vietoje. Palaiko GPT-4, kodų interpretatorių, interneto naršymą, įskiepius.",
  "lv": "Ātrākais veids, kā izmantot ChatGPT, Claude, Bard, Bing jebkurā vietā tiešsaistē. Atbalsta GPT-4, koda interpretatoru, tīmekļa pārlūkošanu, spraudņus.",
  "ml": "ChatGPT, Claude, Bard, Bing ഓൺലൈൻ ഏതുവർക്കും ഉപയോഗിക്കുന്നതിന്റെ വേഗതയുള്ള വഴി. GPT-4, കോഡ് ഇന്റർപ്രറ്റർ, വെബ്ബ് ബ്രൗസിംഗ്, പ്ലഗിൻസ് പിന്തുണയ്ക്കുന്നു.",
  "mr": "ChatGPT, Claude, Bard, Bing ऑनलाइन कुठेही वापरण्याचा सर्वात वेगवान मार्ग. GPT-4, कोड इंटरप्रेटर, वेब ब्राउझिंग, प्लगइन्स समर्थन करतो.",
  "ms": "Cara terpantas untuk menggunakan ChatGPT, Claude, Bard, Bing di mana saja secara dalam talian. Menyokong GPT-4, Penterjemah Kod, Pelayar Web, Pemalam.",
  "nl": "De snelste manier om ChatGPT, Claude, Bard, Bing overal online te gebruiken. Ondersteunt GPT-4, code-interpreter, webbrowsing, plug-ins.",
  "no": "Den raskeste måten å bruke ChatGPT, Claude, Bard, Bing hvor som helst online. Støtter GPT-4, kode tolk, nettlesing, utvidelser.",
  "pl": "Najszybszy sposób na korzystanie z ChatGPT, Claude, Bard, Bing w dowolnym miejscu online. Obsługuje GPT-4, interpreter kodu, przeglądanie sieci web, wtyczki.",
  "pt_BR": "A maneira mais rápida de usar o ChatGPT, Claude, Bard, Bing em qualquer lugar online. Suporta GPT-4, interpretador de código, navegação na web, plugins.",
  "pt_PT": "A forma mais rápida de utilizar o ChatGPT, Claude, Bard, Bing em qualquer lugar online. Suporta GPT-4, intérprete de código, navegação na web, plugins.",
  "ro": "Cea mai rapidă modalitate de a utiliza ChatGPT, Claude, Bard, Bing oriunde online. Suportă GPT-4, interpretor de cod, navigare web, module.",
  "ru": "Самый быстрый способ использовать ChatGPT, Claude, Bard, Bing в любом месте в Интернете. Поддерживает GPT-4, интерпретатор кода, веб-браузер, плагины.",
  "sk": "Najrýchlejší spôsob, ako používať ChatGPT, Claude, Bard, Bing kdekoľvek online. Podporuje GPT-4, interpret kódu, webové prehliadanie, pluginy.",
  "sl": "Najhitrejši način za uporabo ChatGPT, Claude, Bard, Bing kjerkoli na spletu. Podpira GPT-4, tolmač kode, brskanje po spletu, vtičnike.",
  "sr": "Најбржи начин за коришћење ChatGPT, Claude, Bard, Bing било где на интернету. Подржава GPT-4, интерпретер кода, веб прегледање, додатке.",
  "sv": "Det snabbaste sättet att använda ChatGPT, Claude, Bard, Bing var som helst online. Stöder GPT-4, kodtolk, webbläsning, tillägg.",
  "sw": "Njia ya haraka zaidi ya kutumia ChatGPT, Claude, Bard, Bing popote mtandaoni. Inasaidia GPT-4, Interpreter ya Kanuni, Kivinjari cha Wavuti, Programu-jalizi.",
  "ta": "அனைத்து இணையதள இடங்களிலும் ChatGPT, Claude, Bard, Bing ஐப் பயன்படுத்துவதற்கான விரைவான வழி. GPT-4, குறியீட்டு விளக்கமும், இணைய உலாவல், சேர்ப்புகளைக் கொண்டிருக்கின்றது.",
  "te": "ఎవరైనా ఆన్‌లైన్‌లో ChatGPT, Claude, Bard, Bing ఉపయోగించే త్వరితమైన మార్గం. GPT-4, కోడ్ ఇంటర్‌ప్రెటర్, వెబ్ బ్రౌజింగ్, ప్లగిన్లను మద్దతు చేస్తుంది.",
  "th": "วิธีที่เร็วที่สุดในการใช้ ChatGPT, Claude, Bard, Bing ทุกที่ออนไลน์ รองรับ GPT-4, ตัวแปลโค้ด, เว็บเบราว์ซิ่ง, ปลั๊กอิน",
  "tr": "ChatGPT, Claude, Bard, Bing'yi çevrimiçi herhangi bir yerde kullanmanın en hızlı yolu. GPT-4, Kod Yorumlayıcı, Web Tarayıcısı, Eklentileri destekler.",
  "uk": "Найшвидший спосіб використовувати ChatGPT, Claude, Bard, Bing будь-де онлайн. Підтримує GPT-4, інтерпретатор коду, веб-переглядач, плагіни.",
  "vi": "Cách nhanh nhất để sử dụng ChatGPT, Claude, Bard, Bing bất kỳ nơi nào trực tuyến. Hỗ trợ GPT-4, trình thông dịch mã, duyệt web, các plugin.",
  "he_IL": "הדרך המהירה ביותר להשתמש ב-ChatGPT, Claude, Bard, Bing בכל מקום באינטרנט. תומך ב-GPT-4, מפרש קוד, גלישה ברשת, ותוספים.",
  "in": "Cara tercepat untuk menggunakan ChatGPT, Claude, Bard, Bing di mana saja secara online. Mendukung GPT-4, Penerjemah Kode, Penjelajahan Web, Plugin.",
  "ua": "Найшвидший спосіб використовувати ChatGPT, Claude, Bard, Bing будь-де онлайн. Підтримує GPT-4, інтерпретатор коду, веб-переглядач, плагіни."
}
`
const nameJson = `
{
  "en": "MaxAI.me: Use ChatGPT AI Anywhere Online",
  "en_GB": "MaxAI.me: Use ChatGPT AI Anywhere Online",
  "en_US": "MaxAI.me: Use ChatGPT AI Anywhere Online",
  "zh_CN": "MaxAI.me：在任何网页上使用ChatGPT AI",
  "zh_TW": "MaxAI.me：在任何網頁上使用ChatGPT AI",
  "am": "MaxAI.me: በዓለም አይነት በግል የChatGPT AI ይጠቀሙ",
  "ar": "MaxAI.me: استخدم ChatGPT AI في أي مكان عبر الإنترنت",
  "bg": "MaxAI.me: Използвайте ChatGPT AI навсякъде онлайн",
  "bn": "MaxAI.me: চ্যাটজিপিটি এআই কে অনলাইনে যেখানেই ব্যবহার করুন",
  "ca": "MaxAI.me: Utilitza ChatGPT AI en línia a qualsevol lloc",
  "cs": "MaxAI.me: Používejte ChatGPT AI kdekoli online",
  "da": "MaxAI.me: Brug ChatGPT AI Overalt Online",
  "de": "MaxAI.me: Nutzen Sie ChatGPT AI überall online",
  "el": "MaxAI.me: Χρησιμοποιήστε το ChatGPT AI Οπουδήποτε Online",
  "es": "MaxAI.me: Usa ChatGPT AI en cualquier lugar en línea",
  "es_419": "MaxAI.me: Usa ChatGPT AI en cualquier lugar en línea",
  "et": "MaxAI.me: Kasutage ChatGPT AI-d veebis kõikjal",
  "fa": "MaxAI.me: از ChatGPT AI در هر جایی آنلاین استفاده کنید",
  "fi": "MaxAI.me: Käytä ChatGPT AI:ta missä tahansa verkossa",
  "fil": "MaxAI.me: Gamitin ang ChatGPT AI Kahit Saan Online",
  "fr": "MaxAI.me: Utilisez ChatGPT AI n'importe où en ligne",
  "gu": "MaxAI.me: ચેટજીપીટી એઆઈને ઓનલાઇન ક્યારેય પણ ઉપયોગ કરો",
  "he": "MaxAI.me: השתמש ב-ChatGPT AI בכל מקום ברשת",
  "hi": "MaxAI.me: कहीं भी ऑनलाइन ChatGPT AI का उपयोग करें",
  "hr": "MaxAI.me: Koristite ChatGPT AI bilo gdje online",
  "hu": "MaxAI.me: Használja a ChatGPT AI-t bárhol online",
  "id": "MaxAI.me: Gunakan ChatGPT AI Di Mana Saja Online",
  "it": "MaxAI.me: Usa ChatGPT AI ovunque online",
  "ja": "MaxAI.me: いつでもどこでもChatGPT AIを使用",
  "kn": "MaxAI.me: ಚಾಟ್ಜಿಪಿಟಿ AI ಯನ್ನು ಯಾವುದೇ ಆನ್ಲೈನ್ ಸ್ಥಳದಲ್ಲಿಯೂ ಬಳಸಿ",
  "ko": "MaxAI.me: 어디서나 온라인으로 ChatGPT AI를 사용하세요",
  "lt": "MaxAI.me: Naudokite ChatGPT AI bet kur internete",
  "lv": "MaxAI.me: Izmantojiet ChatGPT AI jebkur tiešsaistē",
  "ml": "MaxAI.me: ചാറ്റ്‌ജിപിടി AI ഓൺലൈനിൽ എങ്ങനെയൊക്കെയായാലും ഉപയോഗിക്കുക",
  "mr": "MaxAI.me: कुठेही ऑनलाइन ठिकाणी ChatGPT AI वापरा",
  "ms": "MaxAI.me: Gunakan ChatGPT AI Di Mana Saja Dalam Talian",
  "nl": "MaxAI.me: Gebruik ChatGPT AI overal online",
  "no": "MaxAI.me: Bruk ChatGPT AI Hvor Som Helst Online",
  "pl": "MaxAI.me: Korzystaj z ChatGPT AI W Dowolnym Miejscu Online",
  "pt_BR": "MaxAI.me: Use o ChatGPT AI em qualquer lugar online",
  "pt_PT": "MaxAI.me: Use o ChatGPT AI em qualquer lugar online",
  "ro": "MaxAI.me: Utilizați ChatGPT AI oriunde online",
  "ru": "MaxAI.me: Используйте ChatGPT AI везде онлайн",
  "sk": "MaxAI.me: Používajte ChatGPT AI kdekoľvek online",
  "sl": "MaxAI.me: Uporabljajte ChatGPT AI kjerkoli na spletu",
  "sr": "MaxAI.me: Користите ChatGPT AI било где на мрежи",
  "sv": "MaxAI.me: Använd ChatGPT AI Var Som Helst Online",
  "sw": "MaxAI.me: Tumia ChatGPT AI Mahali Popote Mtandaoni",
 "ta": "MaxAI.me: ஆன்லைனில் எங்கேயும் ChatGPT AI ஐ பயன்படுத்துங்கள்",
  "te": "MaxAI.me: ఏ ఆన్లైన్ స్థలంలో ఉపయోగించుకోండి ChatGPT AI",
  "th": "MaxAI.me: ใช้ ChatGPT AI ที่ไหนก็ได้ออนไลน์",
  "tr": "MaxAI.me: ChatGPT AI'yı Her Yerde Çevrimiçi Kullan",
  "uk": "MaxAI.me: Використовуйте ChatGPT AI Будь-де Онлайн",
  "vi": "MaxAI.me: Sử dụng ChatGPT AI Ở Bất Kỳ Nơi Nào Trực Tuyến",
  "he_IL": "MaxAI.me: השתמש ב-ChatGPT AI בכל מקום ברשת",
  "in": "MaxAI.me: Gunakan ChatGPT AI Di Mana Saja Online",
  "ua": "MaxAI.me: Використовуйте ChatGPT AI Будь-де Онлайн"
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

updateI18nJson(nameJson, (updateText, jsonData) => {
  return {
    ...jsonData,
    name: updateText,
  }
})

const jsonTranslatePrompt = `
You task is to perform the following actions:
1 - Translate each string value in the given JSON object, which is delimited by triple backticks, from English to Chinese.
2 - Output a JSON object that contains the results.
Requirements when translating:
Keep the json structure and keys unchanged
Translate each string value as UX copy, and make each of the translation results suitable to be used as UX copy and looks concise, easy to understand, and professional
JSON object:
\`\`\`
{{JSON}}
\`\`\`
`

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
