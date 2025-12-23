import { ConfigProvider } from 'antd';
import heIL from 'antd/locale/he_IL';
import dayjs from 'dayjs';
import 'dayjs/locale/he';
import { useLanguage } from '../contexts/LanguageContext';

// Configure dayjs to use Hebrew locale
dayjs.locale('he');

export const AntdProvider = ({ children }) => {
  const { isRTL } = useLanguage();

  return (
    <ConfigProvider
      locale={heIL}
      direction={isRTL ? 'rtl' : 'ltr'}
      theme={{
        token: {
          fontFamily: "'Polin Light', 'Polin', 'Arial Hebrew', sans-serif",
          fontSize: 14,
          borderRadius: 8,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
};





