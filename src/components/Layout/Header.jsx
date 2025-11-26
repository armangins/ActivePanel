import { Menu, Bell, Search, User, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import ConnectionStatus from './ConnectionStatus';

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const { t, language, changeLanguage, isRTL } = useLanguage();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className={`flex items-center ${isRTL ? 'flex-row-reverse' : ''} justify-between`}>
        <div className={`flex items-center space-x-4 flex-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-600 hover:text-primary-500"
          >
            <Menu size={24} />
          </button>
          
          <div className="relative flex-1 max-w-md">
            <Search 
              className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400`}
              size={20} 
            />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none`}
            />
          </div>
        </div>
        
        <div className={`flex items-center space-x-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <ConnectionStatus />
          
          {/* Language Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-2 p-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
            >
              <Globe size={20} />
              <span className="hidden md:inline text-sm font-medium">{language.toUpperCase()}</span>
            </button>
            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-20`}>
                  <button
                    onClick={() => {
                      changeLanguage('he');
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-primary-50 rounded-t-lg ${
                      language === 'he' ? 'text-primary-500 font-medium' : ''
                    }`}
                    style={language === 'he' ? { backgroundColor: '#EBF3FF' } : {}}
                  >
                    עברית
                  </button>
                  <button
                    onClick={() => {
                      changeLanguage('en');
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-primary-50 rounded-b-lg ${
                      language === 'en' ? 'text-primary-500 font-medium' : ''
                    }`}
                    style={language === 'en' ? { backgroundColor: '#EBF3FF' } : {}}
                  >
                    English
                  </button>
                </div>
              </>
            )}
          </div>
          
          <button className="relative p-2 text-gray-600 hover:text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
            <Bell size={20} />
            <span className={`absolute top-1 ${isRTL ? 'left-1' : 'right-1'} w-2 h-2 bg-red-500 rounded-full`}></span>
          </button>
          
          <div className={`flex items-center space-x-3 ${isRTL ? 'pr-4 pl-0 border-r' : 'pl-4 border-l'} border-gray-200`}>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={18} className="text-primary-500" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{t('adminUser')}</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

