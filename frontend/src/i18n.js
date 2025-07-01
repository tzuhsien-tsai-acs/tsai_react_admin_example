import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  // 從後端載入翻譯檔
  .use(HttpApi)
  // 自動偵測使用者語言
  .use(LanguageDetector)
  // 將 i18n 實例傳遞給 react-i18next
  .use(initReactI18next)
  // 初始化 i18next
  .init({
    fallbackLng: 'en', // 如果偵測不到語言，預設使用英文
    debug: true, // 開發時設為 true，方便除錯
    // 設定語言偵測器
    detection: {
      // 偵測順序：優先從 localStorage 讀取，其次是瀏覽器設定
      order: ['localStorage', 'navigator', 'htmlTag'],
      // 將使用者選擇的語言儲存在 'localStorage' 中
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React 已經會處理 XSS，所以設為 false
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // 翻譯檔的路徑
    },
  });

export default i18n;