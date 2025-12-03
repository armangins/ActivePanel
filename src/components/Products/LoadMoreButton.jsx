import { Button } from '../ui';

const LoadMoreButton = ({ onLoadMore, t }) => {
  return (
    <div className="flex justify-center py-8">
      <Button onClick={onLoadMore} variant="secondary">
        {t('loadMore')}
      </Button>
    </div>
  );
};

export default LoadMoreButton;

