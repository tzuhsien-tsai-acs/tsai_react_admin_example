import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Box } from '@mui/material';
// 直接從設定檔中匯入 i18n 實例，確保使用的是完整的物件
import i18n from './i18n';

const languages = [
    { code: 'en', name: 'English' },
    { code: 'zh-TW', name: '繁體中文', match: (lang) => lang?.startsWith('zh') },
    { code: 'ja', name: '日本語' },
];

const LanguageSwitcher = (props) => {
    // 呼叫 useTranslation() 是為了讓此元件訂閱語言變更事件，以觸發 UI 自動更新
    // 我們傳入 props，以便父元件可以傳遞 sx 樣式
    useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        // 移除寫死的定位，讓父元件透過 props 控制樣式
        <Box {...props}>
            {languages.map((lang, index) => {
                // 使用 match 函式處理特殊比對邏輯 (如 'zh-TW', 'zh-CN')，否則直接比對 code
                const isCurrent = lang.match
                    ? lang.match(i18n.language)
                    : i18n.language === lang.code;

                return (
                    <Button
                        key={lang.code}
                        variant={isCurrent ? 'contained' : 'outlined'}
                        onClick={() => changeLanguage(lang.code)}
                        sx={{ mr: index < languages.length - 1 ? 1 : 0 }}
                    >
                        {lang.name}
                    </Button>
                );
            })}
        </Box>
    );
};

export default LanguageSwitcher;