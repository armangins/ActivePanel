/**
 * UploadIcon Component
 * 
 * Custom upload icon with rounded rectangle, cutout in top-right corner, and upward arrow.
 * Based on the design: rounded rectangle with concave scoop in top-right corner and upward arrow inside.
 */
const UploadIcon = ({ size = 32, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Create a mask to cut out the scoop from the rectangle */}
        <mask id="upload-icon-mask">
          <rect width="24" height="24" fill="white" />
          {/* The scoop/cutout circle - cuts out from the rectangle */}
          <circle cx="19" cy="5" r="3.5" fill="black" />
        </mask>
      </defs>
      
      {/* Rounded rectangle - the base shape with cutout applied via mask */}
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        ry="3"
        fill="currentColor"
        mask="url(#upload-icon-mask)"
      />
      
      {/* Arrow pointing upward - positioned in the cutout area */}
      <g transform="translate(19, 5)">
        {/* Arrow shaft (vertical line) - thicker */}
        <line
          x1="0"
          y1="2"
          x2="0"
          y2="-2.5"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Arrow head (triangle pointing up) */}
        <path
          d="M0 -2.5L-3 0.5L3 0.5Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
};

export default UploadIcon;

