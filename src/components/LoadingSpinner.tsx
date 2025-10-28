
const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading MGNREGA data...</p>
        <p className="loading-subtitle">This may take a few moments</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;