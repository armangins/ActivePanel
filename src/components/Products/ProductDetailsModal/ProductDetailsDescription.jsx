import { Typography, theme } from 'antd';
import { sanitizeHTML } from '../../../utils/security';

const { Title } = Typography;

/**
 * ProductDetailsDescription Component
 */
const ProductDetailsDescription = ({ title, content, isRTL }) => {
  const { token } = theme.useToken();
  const sanitizedContent = sanitizeHTML(content || '');

  return (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <Title level={5} style={{ marginBottom: 16 }}>{title}</Title>
      <div
        className="product-description-content" // Hook for global styles if needed, or rely on inherit
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        style={{
          color: token.colorText,
          fontSize: token.fontSize,
          lineHeight: token.lineHeight
        }}
      />
    </div>
  );
};

export default ProductDetailsDescription;


