import { Modal, DatePicker, Space, Typography, Button } from 'antd';
import dayjs from 'dayjs';
import { useLanguage } from '../../../../../contexts/LanguageContext';

const { Text } = Typography;

/**
 * ScheduleModal Component
 * 
 * Modal for scheduling sale start and end dates using Ant Design Modal.
 */
const ScheduleModal = ({ isOpen, onClose, scheduleDates, onDatesChange, onSave }) => {
  const { t, isRTL } = useLanguage();

  const handleStartChange = (date, dateString) => {
    onDatesChange({ ...scheduleDates, start: dateString });
  };

  const handleEndChange = (date, dateString) => {
    onDatesChange({ ...scheduleDates, end: dateString });
  };

  return (
    <Modal
      title={<Text strong>{t('schedule')}</Text>}
      open={isOpen}
      onCancel={onClose}
      onOk={onSave}
      okText={t('save') || 'שמור'}
      cancelText={t('cancel') || 'ביטול'}
      direction={isRTL ? 'rtl' : 'ltr'}
      centered
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
            {t('saleStartDate') || 'תאריך התחלת מבצע'}
          </Text>
          <DatePicker
            showTime
            value={scheduleDates.start ? dayjs(scheduleDates.start) : null}
            onChange={handleStartChange}
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            size="large"
            placeholder={t('selectDate') || 'בחר תאריך'}
          />
        </div>

        <div>
          <Text strong style={{ display: 'block', marginBottom: 8, textAlign: 'right' }}>
            {t('saleEndDate') || 'תאריך סיום מבצע'}
          </Text>
          <DatePicker
            showTime
            value={scheduleDates.end ? dayjs(scheduleDates.end) : null}
            onChange={handleEndChange}
            format="YYYY-MM-DD HH:mm"
            style={{ width: '100%' }}
            size="large"
            placeholder={t('selectDate') || 'בחר תאריך'}
          />
        </div>
      </Space>
    </Modal>
  );
};

export default ScheduleModal;
