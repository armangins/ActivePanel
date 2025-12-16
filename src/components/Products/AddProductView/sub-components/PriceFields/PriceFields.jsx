import { CalculatorOutlined as Calculator, CalendarOutlined as Calendar } from '@ant-design/icons';
import { Row, Col, Button as AntButton, Tooltip, Tour } from 'antd';
import { Input } from '../../../../ui/inputs';
import { useLanguage } from '../../../../../contexts/LanguageContext';
import { useRef, useState, useEffect } from 'react';

/**
 * PriceFields Component
 * 
 * Handles regular price, sale price, and stock quantity inputs in a single row.
 */
const PriceFields = ({
  formData,
  errors,
  onRegularPriceChange,
  onSalePriceChange,
  onStockChange,
  onCalculatorClick,
  onScheduleClick,
  scheduleDates
}) => {
  const { t, isRTL } = useLanguage();

  // Refs for tour targets
  const calculatorRef = useRef(null);
  const scheduleRef = useRef(null);

  const [tourOpen, setTourOpen] = useState(false);
  const [hasShownTour, setHasShownTour] = useState(() => {
    // Check if tour has been shown before (using sessionStorage for session-based)
    return sessionStorage.getItem('priceTourShown_v3') === 'true';
  });

  // Trigger tour when user first enters a regular price
  useEffect(() => {
    if (!hasShownTour && formData.regular_price && parseFloat(formData.regular_price) > 0) {
      // Small delay to ensure refs are ready
      const timer = setTimeout(() => {
        setTourOpen(true);
        setHasShownTour(true);
        sessionStorage.setItem('priceTourShown_v3', 'true');
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [formData.regular_price, hasShownTour]);

  // Tour steps
  const tourSteps = [
    {
      title: 'תמחור חכם',
      description: ' מתמחרים בקלות עם המחשבון החכם שלנו על בסיס עלויות, רווח שולי ועוד  לחצו על האייקון והתחילו לתמחר',
      target: () => calculatorRef.current,
      placement: 'bottom',
    },
    {
      title: 'תזמון מבצע',
      description: 'קבעו תאריכי התחלה וסיום למחירי המבצע. המערכת תעדכן אוטומטית את המחיר בתאריכים שנקבעו.',
      target: () => scheduleRef.current,
      placement: 'bottom',
    },
  ];

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  // Check if schedule dates are set
  const hasScheduleDates = scheduleDates?.start || scheduleDates?.end;
  const scheduleDateText = hasScheduleDates
    ? `${scheduleDates.start ? formatDate(scheduleDates.start) : ''} - ${scheduleDates.end ? formatDate(scheduleDates.end) : ''}`
    : '';

  // Check if sale price is entered
  const hasSalePrice = formData.sale_price && String(formData.sale_price).trim() !== '' && parseFloat(formData.sale_price) > 0;

  return (
    <>
      <Row gutter={16}>
        {/* Regular Price */}
        <Col xs={24} md={8}>
          <div>
            <Input
              label={t('regularPrice')}
              type="number"
              value={formData.regular_price}
              onChange={(value) => onRegularPriceChange(value)}
              placeholder="0.00"
              error={errors.regular_price?.message}
              step="0.01"
              min="0"
              required
              prefix="₪"
              testId="regular-price-input"
              suffix={
                <Tooltip title="תמכור חכם">
                  <span ref={calculatorRef} style={{ display: 'inline-flex' }}>
                    <AntButton
                      type="text"
                      icon={<Calculator style={{ fontSize: '18px' }} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onCalculatorClick();
                      }}
                      style={{
                        padding: 0,
                        height: 'auto',
                        color: '#1890ff',
                        cursor: 'pointer',
                        border: 'none',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'auto'
                      }}
                    />
                  </span>
                </Tooltip>
              }
            />
          </div>
        </Col>

        {/* Sale Price */}
        <Col xs={24} md={8}>
          <div>
            <Input
              label={t('salePrice')}
              type="number"
              value={formData.sale_price}
              onChange={(value) => onSalePriceChange(value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              prefix="₪"
              testId="sale-price-input"
              suffix={
                <Tooltip title={hasSalePrice ? "תזמון מבצע" : "יש להזין מחיר מבצע"}>
                  <span ref={scheduleRef} style={{ display: 'inline-flex' }}>
                    <AntButton
                      type="text"
                      icon={<Calendar style={{ fontSize: '18px', opacity: hasSalePrice ? 1 : 0.5 }} />}
                      onClick={(e) => {
                        if (hasSalePrice) {
                          e.stopPropagation();
                          onScheduleClick();
                        }
                      }}
                      disabled={!hasSalePrice}
                      style={{
                        padding: 0,
                        height: 'auto',
                        color: hasSalePrice ? '#1890ff' : '#bfbfbf',
                        cursor: hasSalePrice ? 'pointer' : 'not-allowed',
                        border: 'none',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        pointerEvents: 'auto'
                      }}
                    />
                  </span>
                </Tooltip>
              }
            />
            {hasScheduleDates && (
              <div style={{
                fontSize: '12px',
                color: '#8c8c8c',
                marginTop: '4px',
                textAlign: isRTL ? 'right' : 'left'
              }}>
                {scheduleDateText}
              </div>
            )}
          </div>
        </Col>

        {/* Stock Quantity */}
        <Col xs={24} md={8}>
          <Input
            label={t('stockQuantity') || 'כמות במלאי'}
            type="number"
            value={formData.stock_quantity || ''}
            onChange={(value) => onStockChange(value)}
            placeholder="0"
            error={errors.stock_quantity?.message}
            min="0"
            step="1"
            required={formData.manage_stock}
            testId="stock-quantity-input"
          />
        </Col>
      </Row>

      {/* Tour Guide */}
      <style>{`
        .rtl-tour-swap .ant-tour-footer {
          direction: ltr !important;
        }
      `}</style>
      <Tour
        open={tourOpen}
        onClose={() => setTourOpen(false)}
        steps={tourSteps}
        rootClassName="rtl-tour-swap"
      />
    </>
  );
};

export default PriceFields;
