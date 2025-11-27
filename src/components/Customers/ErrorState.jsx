/**
 * ErrorState Component
 * 
 * Displays error message when customer loading fails.
 * 
 * @param {String} error - Error message
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 */
const ErrorState = ({ error, isRTL }) => {
  return (
    <div className="card bg-red-50 border-red-200">
      <p className="text-red-600">{error}</p>
    </div>
  );
};

export default ErrorState;


