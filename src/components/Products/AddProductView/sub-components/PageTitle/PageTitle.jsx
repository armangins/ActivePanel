import { memo } from 'react';
import { Typography, Flex, theme } from 'antd';

const { Title, Text } = Typography;

/**
 * PageTitle Component
 */
const PageTitle = ({
  title,
  subtitle,
  actions,
  reverseLayout = false,
  size = 'lg',
  spacing = 'lg',
}) => {
  // Size variants for title mapped to Antd Title levels
  const sizeLevel = {
    sm: 5,
    md: 4,
    lg: 2,
    xl: 1,
  };

  const marginBottomMap = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
  };

  // Normalize actions to array (handle single action, array of actions, or null)
  const actionsArray = actions
    ? (Array.isArray(actions) ? actions : [actions]).filter(Boolean)
    : [];

  // Don't render if no title
  if (!title) {
    return null;
  }

  return (
    <div
      style={{
        marginBottom: marginBottomMap[spacing] ?? 24,
        display: 'flex',
        flexDirection: reverseLayout ? 'row-reverse' : 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        width: '100%',
        flexWrap: 'wrap'
      }}
    >
      {/* Title Section */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        {title && (
          <Title
            level={sizeLevel[size] || 2}
            style={{ margin: 0 }}
          >
            {title}
          </Title>
        )}
        {subtitle && (
          <Text
            type="secondary"
            style={{ marginTop: 4, display: 'block' }}
          >
            {subtitle}
          </Text>
        )}
      </div>

      {/* Actions Section */}
      {actionsArray.length > 0 && (
        <Flex
          gap="small"
          wrap="wrap"
          justify={reverseLayout ? 'flex-start' : 'flex-end'}
        >
          {actionsArray.map((action, index) => (
            <div key={action?.key || index}>
              {action}
            </div>
          ))}
        </Flex>
      )}
    </div>
  );
};

export default memo(PageTitle);
