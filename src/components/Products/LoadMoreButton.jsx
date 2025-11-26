const LoadMoreButton = ({ onLoadMore, t }) => {
  return (
    <div className="flex justify-center py-8">
      <button onClick={onLoadMore} className="btn-secondary">
        {t('loadMore')}
      </button>
    </div>
  );
};

export default LoadMoreButton;

