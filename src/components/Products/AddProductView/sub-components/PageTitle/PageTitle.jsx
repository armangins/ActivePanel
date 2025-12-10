import { memo } from 'react';

/**
 * PageTitle Component
 * 
 * A flexible and reusable page title component with support for:
 * 
 * @param {string|ReactNode} title - Main page title (required)
 * @param {string|ReactNode} subtitle - Optional subtitle/description text
 * @param {ReactNode|Array<ReactNode>} actions - Optional action buttons/links (single or array)
 * @param {string} className - Additional CSS classes for the container
 * @param {string} titleClassName - Additional CSS classes for the title
 * @param {string} subtitleClassName - Additional CSS classes for the subtitle
 * @param {string} actionsClassName - Additional CSS classes for the actions container
 * @param {boolean} reverseLayout - If true, uses flex-row-reverse instead of flex-row (default: false)
 * @param {string} size - Title size: 'sm', 'md', 'lg', 'xl' (default: 'lg')
 * @param {boolean} alignRight - If true, aligns title to right (default: true for RTL)
 * @param {string} spacing - Bottom margin: 'none', 'sm', 'md', 'lg' (default: 'lg')
 */
const PageTitle = ({
  title,
  subtitle,
  actions,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
  actionsClassName = '',
  reverseLayout = false,
  size = 'lg',
  alignRight = true,
  spacing = 'lg',
}) => {
  // Size variants for title
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  // Spacing variants for bottom margin
  const spacingClasses = {
    none: '',
    sm: 'mb-3',
    md: 'mb-4',
    lg: 'mb-6',
    xl: 'mb-8',
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
      className={`
        flex items-center justify-between
        ${reverseLayout ? 'flex-row-reverse' : 'flex-row'}
        ${spacingClasses[spacing] || spacingClasses.lg}
        ${className}
      `.trim()}
    >
      {/* Title Section - Flexible width, allows text wrapping */}
      <div className="flex-1 min-w-0">
        {title && (
          <h1
            className={`
              ${sizeClasses[size] || sizeClasses.lg}
              font-bold text-gray-900
              ${alignRight ? 'text-right' : 'text-left'}
              ${titleClassName}
            `.trim()}
          >
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            className={`
              text-sm text-gray-600 mt-1
              ${alignRight ? 'text-right' : 'text-left'}
              ${subtitleClassName}
            `.trim()}
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Actions Section - Auto-wraps when needed, proper spacing */}
      {actionsArray.length > 0 && (
        <div
          className={`
            flex items-center gap-2 flex-wrap
            ${reverseLayout ? 'justify-start' : 'justify-end'}
            ${actionsClassName}
          `.trim()}
        >
          {actionsArray.map((action, index) => (
            <div key={action?.key || index}>
              {action}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(PageTitle);
