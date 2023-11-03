const descriptionJson = `
{
  "en": "The fastest way to use ChatGPT, Claude, Bard, Bing anywhere online. The only generative AI-powered extension you need.",
  "en_GB": "The fastest way to use ChatGPT, Claude, Bard, Bing anywhere online. The only generative AI-powered extension you need.",
  "en_US": "The fastest way to use ChatGPT, Claude, Bard, Bing anywhere online. The only generative AI-powered extension you need.",
  "zh_CN": "在线使用ChatGPT、Claude、Bard、Bing的最快方式。您唯一需要的生成式AI扩展。",
  "zh_TW": "在線使用ChatGPT、Claude、Bard、Bing的最快方式。您唯一需要的生成式AI擴展。",
  "am": "ChatGPT, Claude, Bard, Bing-ን በመጫን የታቀየለት በድርጊት ነው። ሁሉም ባህር ማድረግ በእርስዎ አይደለም።",
  "ar": "أسرع طريقة لاستخدام ChatGPT وClaude وBard وBing في أي مكان عبر الإنترنت. الإمتداد الوحيد المدعوم بالذكاء الاصطناعي الذي تحتاجه.",
  "bg": "Най-бързият начин да използвате ChatGPT, Claude, Bard, Bing навсякъде онлайн. Единственото AI-захранвано разширение, от което имате нужда.",
  "bn": "চ্যাটজিপিটি, ক্লোড, বার্ড, বিং যেখানেই অনলাইনে ব্যবহার করার সবচেয়ে দ্রুত উপায়। আপনি যেটি প্রয়োজন তা হল একটি জেনারেটিভ এআই পাওয়ারড এক্সটেনশন।",
  "ca": "La manera més ràpida d'utilitzar ChatGPT, Claude, Bard, Bing a qualsevol lloc en línia. L'única extensió amb IA generativa que necessites.",
  "cs": "Nejrychlejší způsob, jak používat ChatGPT, Claude, Bard, Bing kdekoli online. Jedná se o jediné rozšíření s generativním umělým inteligentním systémem, které potřebujete.",
  "da": "Den hurtigste måde at bruge ChatGPT, Claude, Bard, Bing overalt online. Den eneste generative AI-drevne udvidelse, du har brug for.",
  "de": "Der schnellste Weg, ChatGPT, Claude, Bard, Bing überall online zu nutzen. Die einzige generative KI-gesteuerte Erweiterung, die Sie benötigen.",
  "el": "Ο ταχύτερος τρόπος να χρησιμοποιήσετε το ChatGPT, τον Claude, τον Bard, τον Bing οπουδήποτε online. Το μοναδικό AI-powered πρόσθετο που χρειάζεστε.",
  "es": "La forma más rápida de usar ChatGPT, Claude, Bard, Bing en cualquier lugar en línea. La única extensión con inteligencia artificial generativa que necesitas.",
  "es_419": "La forma más rápida de usar ChatGPT, Claude, Bard, Bing en cualquier lugar en línea. La única extensión con inteligencia artificial generativa que necesitas.",
  "et": "Kõige kiirem viis kasutada ChatGPT, Claude, Bard, Bing kõikjal võrgus. Ainuke tehisintellektiga varustatud generatiivne laiendus, mida vajate.",
  "fa": "سریعترین راه برای استفاده از ChatGPT، Claude، Bard، Bing در هر کجا آنلاین است. تنها افزونه مجهز به هوش مصنوعی تولیدی که نیاز دارید.",
  "fi": "Nopein tapa käyttää ChatGPT, Claude, Bard, Bing missä tahansa verkossa. Ainoa generatiivinen tekoälyä käyttävä laajennus, jonka tarvitset.",
  "fil": "Ang pinakamabilis na paraan para gamitin ang ChatGPT, Claude, Bard, Bing kahit saan online. Ang tanging generative AI powered extension na kailangan mo.",
  "fr": "La manière la plus rapide d'utiliser ChatGPT, Claude, Bard, Bing n'importe où en ligne. La seule extension alimentée par l'IA générative dont vous avez besoin.",
  "gu": "ChatGPT, Claude, Bard, Bingનો ઓનલાઇન ક્યારેય વપરવાનો સભેશેષ વગરનો તરત રસ્તો. શ્રેષ્ઠ જેનરેટિવ AI પવર એક્સ્ટેન્શન જોઈ ને તમે જોઈ છો.",
  "he": "הדרך הכי מהירה להשתמש ב-ChatGPT, Claude, Bard, Bing בכל מקום באינטרנט. הרחבת הבנייה היחידה שאתה צריך.",
  "hi": "ChatGPT, Claude, Bard, Bing का उपयोग कहीं भी ऑनलाइन करने का सबसे तेज तरीका। जिसकी आपको आवश्यकता है, वह केवल जेनरेटिव एआई पावर्ड एक्सटेंशन है।",
  "hr": "Najbrži način za upotrebu ChatGPT, Claude, Bard, Bing bilo gdje online. Jedini generativni AI-powered dodatak koji vam treba.",
  "hu": "A ChatGPT, Claude, Bard, Bing online bárhol történő leggyorsabb használatának módja. Az egyetlen generatív AI hajtotta kiterjesztés, amire szükséged van.",
  "id": "Cara tercepat untuk menggunakan ChatGPT, Claude, Bard, Bing di mana saja secara online. Satu-satunya ekstensi yang didukung AI generatif yang Anda butuhkan.",
  "it": "Il modo più veloce per utilizzare ChatGPT, Claude, Bard, Bing ovunque online. L'unica estensione con intelligenza artificiale generativa di cui hai bisogno.",
  "ja": "ChatGPT、Claude、Bard、Bingをどこでもオンラインで使用する最速の方法。必要な唯一の生成AIパワード拡張機能。",
  "kn": "ಚಾಟ್ಜಿಪಿಟಿ, ಕ್ಲೋಡ್, ಬಾರ್ಡ್, ಬಿಂಗ್ ಯಾವುದೇ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಬಳಸುವ ಅತ್ಯಂತ ವೇಗದ ಮಾರುಗೊಮ್ಮ. ನೀವು ಬಳಸಬೇಕಾದ ಯಾವುದೇ ಜೆನರೇಟಿವ್ ಏಆಯ್‌ಪವರ್ಡ್ ಎಕ್ಸ್ಟೆನ್ಷನ್.",
  "ko": "온라인 어디서나 ChatGPT, Claude, Bard, Bing을 사용하는 가장 빠른 방법. 필요한 유일한 생성적 AI 패워드 확장 기능입니다.",
  "lt": "Greičiausias būdas naudoti ChatGPT, Claude, Bard, Bing bet kur internete. Vienintelis jums reikalingas generatyvinis AI pagrindinis plėtinys.",
  "lv": "Ātrākais veids, kā izmantot ChatGPT, Claude, Bard, Bing jebkur tiešsaistē. Vienīgais ģeneratīvā intelekta spēkā esošais paplašinājums, kas jums nepieciešams.",
  "ml": "ഓൺലൈൻ എങ്ങനെയെങ്കിലും ChatGPT, Claude, Bard, Bing ഉപയോഗിക്കുന്നതിന്നുള്ള അത്യാവശ്യമായ വഴി. നിന്നുള്ള യൂസർ ആവശ്യമായ ജനറേറ്റീവ് എആയ് പവവേഡ് എക്സ്റ്റെൻഷൻ.",
  "mr": "ऑनलाइन चॅटजीपीटी, क्लोड, बार्ड, बिंग वापरण्याचा सर्वात वेगवेगळा मार्ग. तुम्हाला आवश्यक आहे, ते एक मांडणारा AI-संचालित एक्सटेंशन आहे.",
  "ms": "Cara paling cepat untuk menggunakan ChatGPT, Claude, Bard, Bing di mana-mana dalam talian. Satu-satunya sambungan berkuasa AI generatif yang anda perlukan.",
  "nl": "De snelste manier om ChatGPT, Claude, Bard, Bing overal online te gebruiken. De enige generatieve AI-aangedreven extensie die je nodig hebt.",
  "no": "Den raskeste måten å bruke ChatGPT, Claude, Bard, Bing hvor som helst på nettet. Den eneste generative AI-drevne utvidelsen du trenger.",
  "pl": "Najszybszy sposób na korzystanie z ChatGPT, Claude, Bard, Bing w dowolnym miejscu online. Jedyny generatywny rozszerzenie z AI, którego potrzebujesz.",
  "pt_BR": "A maneira mais rápida de usar o ChatGPT, Claude, Bard, Bing em qualquer lugar online. A única extensão alimentada por IA generativa de que você precisa.",
  "pt_PT": "A forma mais rápida de usar o ChatGPT, Claude, Bard, Bing em qualquer lugar online. A única extensão alimentada por IA generativa de que você precisa.",
  "ro": "Cel mai rapid mod de a utiliza ChatGPT, Claude, Bard, Bing oriunde online. Singura extensie cu inteligență artificială generativă de care ai nevoie.",
  "ru": "Самый быстрый способ использовать ChatGPT, Claude, Bard, Bing в Интернете. Единственное расширение, поддерживаемое искусственным интеллектом, которое вам нужно.",
  "sk": "Najrýchlejší spôsob, ako používať ChatGPT, Claude, Bard, Bing kdekoľvek online. Jedinečný generatívny rozšírenie s pohonnou jednotkou AI, ktoré potrebujete.",
  "sl": "Najhitrejši način za uporabo ChatGPT, Claude, Bard, Bing kjerkoli na spletu. Edina generativna razširitev z umetno inteligenco, ki jo potrebujete.",
  "sr": "Најбржи начин да користите ChatGPT, Claude, Bard, Bing било где на мрежи. Једини генеративни AI powered додатак који вам је потребан.",
  "sv": "Det snabbaste sättet att använda ChatGPT, Claude, Bard, Bing var som helst online. Det enda generativa AI-drivna tillägget du behöver.",
  "sw": "Njia ya haraka zaidi ya kutumia ChatGPT, Claude, Bard, Bing popote mtandaoni. Upanuzi wa pekee unaotumiwa na AI ya kizazi unayohitaji.",
  "ta": "ChatGPT, Claude, Bard, Bing ஐ ஆன்லைனில் எங்கேயும் உபயோகிக்கும் விரைவான வழி. உங்கள் தேவைக்கு ஒரு உத்தம உருவாக்கப்பட்ட AI-powered நீட்டியை மட்டும் நீங்கள் கொண்டிருக்கின்றீர்கள்.",
  "te": "ChatGPT, Claude, Bard, Bing ను ఆన్‌లైన్‌లో ఎక్కువ వేగంగా ఉపయోగించడానికి అత్యంత విధినమైన మార్గం. మీకు కావలెను ఏమేను మాత్రమే జెనరేటివ్ AI పవర్డ్ ఎక్స్టెన్షన్.",
  "th": "วิธีที่เร็วที่สุดในการใช้ ChatGPT, Claude, Bard, Bing ที่ไหนก็ได้ออนไลน์ ส่วนขยายเดียวที่คุณต้องการที่มีพลังงาน AI สร้าง",
  "tr": "ChatGPT, Claude, Bard, Bing'i çevrimiçi her yerde kullanmanın en hızlı yolu. İhtiyacınız olan tek generatif AI destekli eklenti.",
  "uk": "Найшвидший спосіб використовувати ChatGPT, Claude, Bard, Bing будь-де онлайн. Єдиний генеративний розширення, яке вам потрібно.",
  "vi": "Cách nhanh nhất để sử dụng ChatGPT, Claude, Bard, Bing bất kỳ nơi nào trực tuyến. Tiện ích mở rộng được trang bị trí tuệ nhân tạo duy nhất mà bạn cần.",
  "he_IL": "הדרך הכי מהירה להשתמש ב-ChatGPT, Claude, Bard, Bing בכל מקום באינטרנט. הרחבת הבנייה היחידה שאתה צריך.",
  "in": "Cara tercepat untuk menggunakan ChatGPT, Claude, Bard, Bing di mana saja secara online. Satu-satunya ekstensi yang didukung AI generatif yang Anda butuhkan.",
  "ua": "Найшвидший спосіб використовувати ChatGPT, Claude, Bard, Bing будь-де онлайн. Єдиний генеративний розширення, яке вам потрібно."
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
/**
 * @deprecated
 * @param jsonSources
 * @param updateFn
 */
const updateI18nJson = (jsonSources, updateFn) => {
  console.error('这个方法已经废弃了, 请使用: \nnode update_i18n.mjs')
  return
  // get folder lang folders
  const langFolders = fs.readdirSync(folder).filter((file) => {
    return (
      !file.startsWith('.') &&
      !file.startsWith('index.ts') &&
      !file.startsWith('locales') &&
      !file.startsWith('types') &&
      !file.startsWith('hooks')
    )
  })
  const jsonSourceData = JSON.parse(jsonSources)
  const keys = Object.keys(jsonSourceData)
  if (keys.length < langFolders.length) {
    langFolders
      .filter((lang) => !keys.includes(lang))
      .forEach((lang) => {
        console.log('need update description', lang)
      })
    throw new Error(
      `need update description, cause langFolders.length !== keys.length ${keys.length}/${langFolders.length}`,
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
"hy":"",
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
