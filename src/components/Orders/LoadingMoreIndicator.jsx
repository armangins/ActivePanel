/**
 * LoadingMoreIndicator Component
 * 
 * Displays loading indicator when loading more orders via infinite scroll.
 * 
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 */
const LoadingMoreIndicator = ({ isRTL }) => {
  return (
    <div className="flex justify-center py-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
    </div>
  );
};

export default LoadingMoreIndicator;


