const LoadingMoreIndicator = ({ t }) => {
  return (
    <div className="flex justify-center py-8">
      <div className="flex items-center space-x-2 text-gray-600">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
        <span>{t('loading')}</span>
      </div>
    </div>
  );
};

export default LoadingMoreIndicator;

