const descriptionJson = `
{
  "en":"Your AI-Powered Copilot for the Web. Use ChatGPT (Plugins & GPT-4), Bard, Bing, and Claude on any website without copy-pasting.",
  "en_GB":"Your AI-Powered Copilot for the Web. Use ChatGPT (Plugins & GPT-4), Bard, Bing, and Claude on any website without copy-pasting.",
  "en_US":"Your AI-Powered Copilot for the Web. Use ChatGPT (Plugins & GPT-4), Bard, Bing, and Claude on any website without copy-pasting.",
  "zh_CN":"您的AI网络副驾驶员。在任何网站上使用ChatGPT（插件和GPT-4）、Bard、Bing和Claude，无需复制粘贴。",
  "zh_TW":"您的AI網路副駕駛。在任何網站上使用ChatGPT（外掛程式和GPT-4）、Bard、Bing和Claude，無需複製貼上。",
  "am":"የእርስዎ የAI ተሳሂቅ ለዌብ። ChatGPT (ጥናዎች & GPT-4)፣ Bard፣ Bingና Claudeን በማንኛውም ድህረ ገጽ ውስጥ ያጠቀሙት፣ ሳይገልበት።",
  "ar":"مساعدك الذكي بالذكاء الاصطناعي للويب. استخدم ChatGPT (الإضافات و GPT-4)، وBard، وBing، وClaude على أي موقع ويب دون الحاجة للنسخ واللصق.",
  "bg":"Вашият помощник с изкуствен интелект за интернет. Използвайте ChatGPT (плъгини и GPT-4), Bard, Bing и Claude на всеки сайт без да копирате и поставяте.",
  "bn":"আপনার ওয়েবের জন্য এআই-পাওয়ারড কো-পায়লট। চ্যাটজিপিটি (প্লাগইন এবং জিপিটি-৪), বার্ড, বিং এবং ক্লোড ব্যবহার করুন যেকোনো ওয়েবসাইটে কপি-পেস্ট ছাড়া।",
  "ca":"El vostre copilot alimentat per AI per a la web. Utilitzeu ChatGPT (complements i GPT-4), Bard, Bing i Claude a qualsevol lloc web sense copiar i enganxar.",
  "cs":"Váš AI poháněný kopilot pro web. Používejte ChatGPT (pluginy & GPT-4), Bard, Bing a Claude na jakékoli webové stránce bez kopírování a vkládání.",
  "da":"Din AI-drevne kopilot til nettet. Brug ChatGPT (Plugins & GPT-4), Bard, Bing og Claude på ethvert websted uden at kopiere og indsætte.",
  "de":"Ihr KI-gesteuerter Copilot für das Web. Verwenden Sie ChatGPT (Plugins & GPT-4), Bard, Bing und Claude auf jeder Website ohne Kopieren und Einfügen.",
  "el":"Ο ισχυροποιημένος με AI συνοδηγός σας για τον ιστό. Χρησιμοποιήστε το ChatGPT (Πρόσθετα & GPT-4), το Bard, το Bing και το Claude σε οποιαδήποτε ιστοσελίδα χωρίς αντιγραφή και επικόλληση.",
  "es":"Tu copiloto potenciado por IA para la web. Utiliza ChatGPT (Plugins y GPT-4), Bard, Bing y Claude en cualquier sitio web sin necesidad de copiar y pegar.",
  "es_419":"Tu copiloto impulsado por IA para la web. Usa ChatGPT (Plugins & GPT-4), Bard, Bing y Claude en cualquier sitio web sin copiar y pegar.",
  "et":"Teie AI-toega veebi kopiloot. Kasutage ChatGPT-d (pluginad & GPT-4), Bardi, Bingi ja Claude'i mis tahes veebisaidil ilma kopeerimis- ja kleepimiseta.",
  "fa":"دستیار هوش مصنوعی شما برای وب. از ChatGPT (پلاگین ها و GPT-4)، Bard، Bing و Claude در هر وب سایت بدون کپی کردن استفاده کنید.",
  "fi":"AI:lla tehostettu kopilotti verkossa. Käytä ChatGPT:tä (liitännäiset ja GPT-4), Bardia, Bingiä ja Claudea millä tahansa verkkosivustolla ilman kopioimista ja liittämistä.",
  "fil":"Ang iyong AI-Powered Copilot para sa Web. Gamitin ang ChatGPT (Mga Plugin & GPT-4), Bard, Bing, at Claude sa anumang website nang walang copy-pasting.",
  "fr":"Votre copilote propulsé par l'IA pour le Web. Utilisez ChatGPT (Plugins & GPT-4), Bard, Bing et Claude sur n'importe quel site Web sans copier-coller.",
  "gu":"તમારો AI-પાવરેડ કોપાયલોટ વેબ માટે. ChatGPT (પ્લગિન્સ & GPT-4), બાર્ડ, બિંગ અને ક્લોડ વાપરો કોઈપણ વેબસાઇટ પર કોપી પેસ્ટ વગર.",
  "he":"השותף שלך המונע על ידי AI לאינטרנט. השתמש ב-ChatGPT (תוספים ו- GPT-4), Bard, Bing ו-Claude בכל אתר ללא העתקה והדבקה.",
  "hi":"आपका वेब के लिए एआई-संचालित सहयोगी। ChatGPT (प्लगइन्स और GPT-4), बार्ड, बिंग और क्लॉड का उपयोग किसी भी वेबसाइट पर कॉपी-पेस्ट के बिना करें।",
  "hr":"Vaš kopilot za web pokretan AI-jem. Koristite ChatGPT (Dodaci & GPT-4), Bard, Bing i Claude na bilo kojoj web stranici bez kopiranja i lijepljenja.",
  "hu":"Az AI által meghajtott másodpilótád a weben. Használd a ChatGPT (bővítmények & GPT-4), Bard, Bing és Claude szolgáltatásokat bármely weboldalon másolás és beillesztés nélkül.",
  "id":"Copilot Anda yang ditenagai AI untuk Web. Gunakan ChatGPT (Plugin & GPT-4), Bard, Bing, dan Claude di situs web apa pun tanpa menyalin dan menempel.",
  "it":"Il tuo copilota per il Web alimentato da AI. Usa ChatGPT (Plugins & GPT-4), Bard, Bing e Claude su qualsiasi sito web senza copia-incolla.",
  "ja":"あなたのAIパワードのWebコパイロット。ChatGPT（プラグイン＆GPT-4）、Bard、Bing、Claudeを任意のウェブサイトでコピーペーストなしで使用します。",
  "kn":"ನಿಮ್ಮ AI-ಪ್ರೇರಿತ ವೆಬ್ ಸಹಕರು. ChatGPT (ಪ್ಲಗಿನ್ಗಳು & GPT-4), ಬಾರ್ಡ್, ಬಿಂಗ್, ಕ್ಲೌಡ್ ಅನ್ನು ಯಾವುದೇ ವೆಬ್ಸೈಟ್ನಲ್ಲಿ ಕಾಪಿ ಪೇಸ್ಟ್ ಮಾಡದೆ ಬಳಸಿ.",
  "ko":"웹을 위한 AI 구동 코파일럿입니다. ChatGPT (플러그인 & GPT-4), Bard, Bing, Claude를 어떤 웹사이트에서든 복사 붙여넣기 없이 사용하세요.",
  "lt":"Jūsų AI varomas kopilotas internete. Naudokite ChatGPT (įskiepiai ir GPT-4), Bard, Bing ir Claude bet kurioje svetainėje be kopijavimo ir įklijavimo.",
  "lv":"Jūsu AI vadītais līdpilots tīmeklī. Lietojiet ChatGPT (spraudņi & GPT-4), Bard, Bing un Claude jebkurā tīmekļa vietnē bez kopēšanas un ielīmēšanas.",
  "ml":"നിങ്ങളുടെ AI-പ്രേരിപ്പിച്ച വെബ് കോ-പൈലറ്റ്. ChatGPT (പ്ലഗിനുകളും GPT-4 ഉം), ബാർഡ്, ബിംഗ്, ക്ലൗഡ് എന്നിവ ഏത് വെബ്സൈറ്റിലും കോപ്പി-പേസ്റ്റ് ചെയ്യാതെ ഉപയോഗിക്കുക.",
  "mr":"तुमचा AI-पावर्ड को-पायलट वेबसाईटसाठी. ChatGPT (प्लग-इन & GPT-4), बार्ड, बिंग, आणि क्लॉड वापरा कोणत्याही वेबसाईटवर कॉपी-पेस्ट करण्याशिवाय.",
  "ms":"Kopilot AI Anda untuk Web. Gunakan ChatGPT (Plugin & GPT-4), Bard, Bing, dan Claude di mana-mana laman web tanpa salin tampal.",
  "nl":"Uw AI-aangedreven copiloot voor het web. Gebruik ChatGPT (Plugins & GPT-4), Bard, Bing en Claude op elke website zonder kopiëren en plakken.",
  "no":"Din AI-drevne kopilot for nettet. Bruk ChatGPT (tillegg & GPT-4), Bard, Bing og Claude på ethvert nettsted uten å kopiere og lime inn.",
  "pl":"Twój kopilot zasilany przez AI do sieci. Używaj ChatGPT (wtyczki & GPT-4), Bard, Bing i Claude na dowolnej stronie internetowej bez kopiowania i wklejania.",
  "pt_BR":"Seu copiloto alimentado por IA para a Web. Use o ChatGPT (Plugins & GPT-4), Bard, Bing e Claude em qualquer site sem copiar e colar.",
  "pt_PT":"O seu copiloto alimentado por IA para a Web. Utilize o ChatGPT (Plugins & GPT-4), Bard, Bing e Claude em qualquer site sem copiar e colar.",
  "ro":"Copilotul dvs. alimentat de AI pentru web. Utilizați ChatGPT (Plugin-uri și GPT-4), Bard, Bing și Claude pe orice site web fără a copia și lipi.",
  "ru":"Ваш AI-пилот для Интернета. Используйте ChatGPT (плагины и GPT-4), Bard, Bing и Claude на любом сайте без копирования и вставки.",
  "sk":"Váš sprievodca webom poháňaný AI. Použite ChatGPT (doplnky & GPT-4), Bard, Bing a Claude na akejkoľvek webovej stránke bez kopírovania a vkladania.",
  "sl":"Vaš kopilot, ki ga poganja AI, za splet. Uporabite ChatGPT (vstavki & GPT-4), Bard, Bing in Claude na kateri koli spletni strani brez kopiranja in lepljenja.",
  "sr":"Ваш AI-погон копилот за веб. Користите ChatGPT (додаци & GPT-4), Бард, Бинг и Клод на било којој веб страници без копирања и лепљења.",
  "sv":"Din AI-drivna kopilot för webben. Använd ChatGPT (Plugins & GPT-4), Bard, Bing och Claude på valfri webbplats utan att kopiera och klistra in.",
  "sw":"Msaidizi wako wa AI kwa Mtandao. Tumia ChatGPT (Vifaa vya nyongeza & GPT-4), Bard, Bing, na Claude kwenye tovuti yoyote bila kuiga na kuweka.",
  "ta":"உங்கள் AI-ஆதரிக்கப்பட்ட வலைக்கு உங்கள் உதவியாளர். ChatGPT (செருகுநிரல்கள் & GPT-4), பார்டு, பிங், குளோட் என்ற இவற்றை எந்த வலைத்தளத்திலும் நகலெடுப்பு-ஒட்டும் இல்லாமல் பயன்படுத்துங்கள்.",
  "te":"మీ AI-పవర్డ్ వెబ్ కో-పైలట్. ChatGPT (ప్లగిన్లు & GPT-4), బార్డ్, బింగ్, క్లాడ్ ని ఏ వెబ్‌సైట్‌లోనైనా కాపీ-పేస్ట్ చేయకుండా ఉపయోగించండి.",
  "th":"ที่ช่วยขับขี่ AI ของคุณสำหรับเว็บ ใช้ ChatGPT (ปลั๊กอิน & GPT-4), Bard, Bing และ Claude ในเว็บไซต์ใด ๆ โดยไม่ต้องคัดลอกและวาง",
  "tr":"Web için AI destekli yardımcınız. Herhangi bir web sitesinde Kopyala-Yapıştır yapmadan ChatGPT (Eklentiler & GPT-4), Bard, Bing ve Claude'u kullanın.",
  "uk":"Ваш помічник на AI для вебу. Використовуйте ChatGPT (плагіни & GPT-4), Bard, Bing і Claude на будь-якому веб-сайті без копіювання та вставки.",
  "vi":"Phi công phụ của bạn được cung cấp bởi AI cho Web. Sử dụng ChatGPT (Tiện ích & GPT-4), Bard, Bing và Claude trên bất kỳ trang web nào mà không cần sao chép và dán.",
  "he_IL":"השותף שלך המונע על ידי AI לאינטרנט. השתמש ב- ChatGPT (תוספים & GPT-4), Bard, Bing ו- Claude באתר אינטרנט ללא העתקה והדבקה.",
  "in":"Kopilot AI Anda untuk Web. Gunakan ChatGPT (Plugin & GPT-4), Bard, Bing, dan Claude di mana saja tanpa salin tempel.",
  "ua":"Ваш помічник на AI для вебу. Використовуйте ChatGPT (плагіни & GPT-4), Bard, Bing і Claude на будь-якому веб-сайті без копіювання та вставки."
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
