import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Login Welcome Panel Component
 * 
 * Displays welcome message and community information on the login page.
 * Only visible on large screens.
 */
const LoginWelcomePanel = () => {
  const { t } = useLanguage();

  return (
    <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-5" 
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center p-12 text-white">
        <h2 className="text-4xl font-bold mb-6">
          {t('welcomeToCommunity') || 'ברוכים הבאים לקהילה שלנו'}
        </h2>
        
        <p className="text-lg text-gray-300 mb-12 leading-relaxed">
          {t('welcomeDescription') || 'ActivePanel עוזרת לבעלי עסקים וחנויות אינטרנטיות לנהל את הפעילות שלהם בצורה חכמה, מסודרת ויעילה — עם לוחות בקרה, מודולים ברורים וממשק נעים, מבוסס AI ומונחה נתונים (Data-driven) שמסדר את כל המידע בעסק.'}
        </p>
        
        <p className="text-lg text-gray-300 mb-12 leading-relaxed">
          {t('welcomeDescription2') || 'הצטרף אלינו והתחל לנהל את העסק שלך בצורה פשוטה וחכמה יותר כבר היום.'}
        </p>

        {/* User Avatars */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex -space-x-3">
            {['א', 'ב', 'ג', 'ד'].map((letter, index) => {
              const colors = [
                'from-blue-400 to-blue-600',
                'from-purple-400 to-purple-600',
                'from-pink-400 to-pink-600',
                'from-green-400 to-green-600',
              ];
              return (
                <div
                  key={index}
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[index]} border-2 border-white flex items-center justify-center text-white font-semibold`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
          <p className="text-gray-300">
            {t('communityStats') || 'יותר מ-17 אלף אנשים הצטרפו אלינו, תורך עכשיו.'}
          </p>
        </div>
      </div>

      {/* Settings Icon */}
      <button className="absolute top-6 left-6 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors z-20">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </div>
  );
};

export default LoginWelcomePanel;






