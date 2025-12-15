import { BulbOutlined } from '@ant-design/icons';
import { Input, Button, Typography } from 'antd';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { TextArea } = Input;
const { Text } = Typography;

/**
 * DescriptionField Component
 * 
 * Textarea for full description with AI improvement button and word count.
 */
const DescriptionField = ({ value, onChange, onImprove, isImproving, error }) => {
  const { t } = useLanguage();

  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleChange = (e) => {
    const newValue = e.target.value;
    const newWordCount = newValue.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (newWordCount <= 400) {
      onChange(newValue);
    }
  };

  return (
    <div>
      <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
        {t('description')}
      </Text>
      <div style={{ position: 'relative' }}>
        <TextArea
          value={value}
          onChange={handleChange}
          placeholder={t('enterDetailedDescription') || 'הכנס תיאור מפורט יותר של המוצר'}
          autoSize={{ minRows: 5, maxRows: 10 }}
          size="large"
          status={error ? 'error' : ''}
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
      {error && (
        <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block', textAlign: 'right' }}>
          {error}
        </Text>
      )}
      <Text type="secondary" style={{ fontSize: 12, marginTop: 4, display: 'block', textAlign: 'right' }}>
        {wordCount}/400 {t('words') || 'מילים'}
      </Text>
    </div>
  );
};

export default DescriptionField;
