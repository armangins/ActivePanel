const EndOfResults = ({ displayedCount, totalCount, t }) => {
  return (
    <div className="text-center py-8 text-gray-500 text-sm">
      {t('showing')} {displayedCount} {t('of')} {totalCount} {t('products').toLowerCase()}
    </div>
  );
};

export default EndOfResults;

