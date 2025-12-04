import { useState, useRef, useEffect } from 'react';
import { XMarkIcon as X, PaperAirplaneIcon as Send, SparklesIcon as Sparkles, ArrowPathIcon as Loader } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { Input } from '../ui/inputs';
import { useLanguage } from '../../contexts/LanguageContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getWorkingModelName, getGeminiAPIKey } from '../../services/gemini';



const ChatAssistant = () => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('aiAssistantWelcome') || 'שלום! אני עוזר AI. איך אוכל לעזור לך היום?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const getGeminiAI = () => {
    const apiKey = getGeminiAPIKey();
    if (!apiKey) {
      return null;
    }
    try {
      return new GoogleGenerativeAI(apiKey);
    } catch (error) {
      return null;
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message immediately
    const updatedMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      const genAI = getGeminiAI();

      if (!genAI) {
        const apiKey = getGeminiAPIKey();
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: apiKey
            ? t('aiAssistantError') || 'שגיאה באתחול Gemini AI. אנא בדוק את מפתח ה-API.'
            : t('aiAssistantError') || 'מפתח API של Gemini לא מוגדר. אנא הגדר VITE_GEMINI_API_KEY בקובץ .env'
        }]);
        setLoading(false);
        return;
      }

      // Get the first available free tier model
      const modelName = await getWorkingModelName();
      const model = genAI.getGenerativeModel({ model: modelName });

      // Build context from conversation history (including the new user message)
      const conversationContext = updatedMessages
        .slice(-6) // Last 6 messages for context (including the new user message)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const prompt = `אתה עוזר מסחר אלקטרוני מועיל שעוזר למשתמשים לנהל את חנות ה-WooCommerce שלהם. 
      
חשוב מאוד: אתה חייב להגיב רק בעברית. כל התשובות שלך חייבות להיות בעברית. אל תשתמש באנגלית או בשפה אחרת אלא אם כן התבקשת במפורש לתרגם או להשתמש במונחים טכניים.

שיחה קודמת:
${conversationContext}

עוזר:`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const assistantMessage = response.text().trim();

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: assistantMessage
      }]);
      setHasError(false);
      setErrorMessage('');
    } catch (error) {
      // Handle quota errors specifically
      let errorMsg = error.message || 'לא הצלחתי לעבד את הבקשה';

      if (error.message && (error.message.includes('quota') || error.message.includes('Quota'))) {
        // Clear cache to try different model next time
        getWorkingModelName(true);
        errorMsg = 'מכסה חרגה. אנא המתן רגע ונסה שוב, או בדוק את תוכנית ה-API שלך.';
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${t('aiAssistantError') || 'שגיאה'}: ${errorMsg}`
      }]);
      setHasError(true);
      setErrorMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Icon Button - Position above mobile nav on mobile */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 lg:bottom-6 right-4 sm:right-6 z-40 bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 h-14 w-14 flex items-center justify-center"
        title={t('aiAssistant') || 'עוזר AI'}
        aria-label={t('aiAssistant') || 'עוזר AI'}
      >
        <Sparkles className="w-6 h-6" />
      </Button>

      {/* Chat Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-20 z-[60]"
            onClick={() => setIsOpen(false)}
          />

          {/* Chat Window - Full screen on mobile, small window on desktop */}
          <div
            className={`fixed inset-0 lg:bottom-6 lg:right-6 lg:w-96 lg:h-[500px] lg:inset-auto lg:rounded-lg bg-white shadow-2xl z-[60] flex flex-col ${isRTL ? 'rtl' : 'ltr'
              }`}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-primary-500 text-white lg:rounded-t-lg">
              <div className="flex items-center gap-2 flex-row-reverse">
                <Sparkles className="w-5 h-5" />
                <h3 className="font-semibold">{t('aiAssistant') || 'עוזר AI'}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-primary-600 hover:text-white"
                aria-label={t('close') || 'סגור'}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                      }`}
                  >
                    <p className="text-sm whitespace-pre-wrap text-right">{message.content}</p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <Loader className="w-4 h-4 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('typeMessage') || 'הקלד הודעה...'}
                  className="text-right"
                  dir="rtl"
                  disabled={loading}
                  containerClassName="flex-1"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || loading}
                  variant="primary"
                  size="icon"
                  className="flex items-center justify-center"
                  aria-label={t('send') || 'שלח'}
                >
                  {loading ? (
                    <Loader className="w-[18px] h-[18px] animate-spin" />
                  ) : (
                    <Send className="w-[18px] h-[18px]" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ChatAssistant;

