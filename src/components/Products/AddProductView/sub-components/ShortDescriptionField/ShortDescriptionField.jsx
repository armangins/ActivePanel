import { BulbOutlined } from '@ant-design/icons';
import { Input, Button, Typography } from 'antd';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * ShortDescriptionField Component
 * 
 * Textarea for short description with AI improvement button.
 */
const ShortDescriptionField = ({ value, onChange, onImprove, isImproving }) => {
  const { t } = useLanguage();

  return (
    <div>
      <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
        {t('shortDescription') || 'תיאור קצר'}
      </Text>
      <div style={{ position: 'relative' }}>
        <TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('enterShortDescription') || 'הכנס תיאור קצר'}
          autoSize={{ minRows: 3, maxRows: 6 }}
          size="large"
          style={{ direction: 'rtl', textAlign: 'right', paddingLeft: '40px' }}
        />
        <Button
          type="text"
          icon={
            isImproving ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            ) : (
              <BulbOutlined />
            )
          }
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (value.trim()) {
              onImprove();
            }
          }}
          disabled={isImproving || !value.trim()}
          style={{
            position: 'absolute',
            left: '8px',
            top: '8px',
            zIndex: 1,
            color: isImproving || !value.trim() ? '#d9d9d9' : '#1890ff'
          }}
          title={t('createWithAI') || 'צור בעזרת AI'}
        />
      </div>
    </div>
  );
};

export default ShortDescriptionField;
