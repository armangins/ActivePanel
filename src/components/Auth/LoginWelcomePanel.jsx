import { useLanguage } from '../../contexts/LanguageContext';
import { Button } from '../ui';

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
        ActivePanel הפכו את ניהול חנויות האיקומרס שלכם לנוחה, מהירה ויעילה מאי פעם. הצטרפו עוד היום למאות עסקים שבחרו לעבוד חכם ולצמוח אתנו.
        </p>


        {/* User Avatars */}
        <div className="flex items-center gap-4 mb-8">
        <p className="text-gray-300">
    הצטרפו למאות עסקים שכבר בחרו Active Panel 
          </p>
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
        
        </div>
      </div>
    </div>
  );
};

export default LoginWelcomePanel;









