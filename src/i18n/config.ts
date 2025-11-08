import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  ur: {
    translation: {
      dashboard: 'ڈیش بورڈ',
      students: 'طلباء',
      teachers: 'اساتذہ',
      classes: 'کلاسز',
      courses: 'کورسز',
      attendance: 'حاضری',
      fees: 'فیسیں',
      income: 'آمدن',
      expenses: 'اخراجات',
      financialReports: 'مالیاتی رپورٹس',
      educationReports: 'تعلیمی رپورٹس',
      settings: 'ترتیبات',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ur',
    fallbackLng: 'ur',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
