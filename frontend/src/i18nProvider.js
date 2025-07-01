import i18n from './i18n';

/**
 * 建立一個 i18nProvider，作為 react-admin 和 i18next 之間的橋樑。
 * 這確保了整個應用程式（包括登入頁面和 react-admin 內部）
 * 使用同一個 i18n 實例和語言狀態。
 */
const i18nProvider = {
    // react-admin 用這個函式來翻譯文字
    translate: (key, options) => i18n.t(key, options),

    // 當 react-admin 內部需要改變語言時呼叫 (例如，如果使用內建的語言切換器)
    changeLocale: (locale) => i18n.changeLanguage(locale),

    // 取得當前語言
    getLocale: () => i18n.language,
};

export default i18nProvider;