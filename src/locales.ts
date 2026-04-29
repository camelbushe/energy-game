import locales from '../locales.json' with {type: 'json'};

type Language = keyof typeof locales

let currentLanguage: Language = "ru"

function isObjectKey(code: string, obj: object): code is keyof typeof obj {
    return code in obj;
}

export function getLocale(code: string) {
    const currentLanguageLocales = locales[currentLanguage];
    if (isObjectKey(code, currentLanguageLocales)) {
        return currentLanguageLocales[code]
    } else {
        return code
    }
}

export function setCurrentLanguage(language: Language) {
    currentLanguage = language
}