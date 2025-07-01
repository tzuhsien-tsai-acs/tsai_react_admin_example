import polyglotI18nProvider from 'ra-i18n-polyglot';
import chineseMessages from 'ra-language-chinese';
import englishMessages from 'ra-language-english';
import japaneseMessages from 'ra-language-japanese';

// 補齊缺失的 key
const customZh = {
    ...chineseMessages,
    ra: {
        ...chineseMessages.ra,
        configurable: {
            customize: '自訂',
        },
        sort: {
            ASC: '升序',
            DESC: '降序',
        },
        action: {
            ...chineseMessages?.ra?.action,
            unselect: '取消選取',
        },
    },
};

const customJa = {
    ...japaneseMessages,
    ra: {
        ...japaneseMessages.ra,
        configurable: {
            customize: 'カスタマイズ',
        },
        sort: {
            ASC: '昇順',
            DESC: '降順',
        },
        action: {
            ...japaneseMessages?.ra?.action,
            unselect: '選択解除',
        },
    },
};

const messages = {
    zh: customZh,
    en: englishMessages,
    ja: customJa,
};

const i18nProvider = polyglotI18nProvider(
    (locale) => messages[locale] ? messages[locale] : messages.en,
    'zh',
    [
        { locale: 'en', name: 'English' },
        { locale: 'zh', name: '中文' },
        { locale: 'ja', name: '日本語' }
    ]
);

export default i18nProvider;