const ErrorState = ({ error, onRetry, t }) => {
  return (
    <div className="card">
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={onRetry} className="btn-primary">
          {t('retry')}
        </button>
      </div>
    </div>
  );
};

export default ErrorState;

