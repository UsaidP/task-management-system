import React from 'react';

const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div role="alert" className="flex flex-col items-center justify-center h-screen bg-light-bg-primary dark:bg-dark-bg-primary text-light-text-primary dark:text-dark-text-primary">
      <h2 className="text-2xl font-bold text-accent-danger mb-4">Something went wrong:</h2>
      <pre className="text-accent-danger bg-light-bg-secondary dark:bg-dark-bg-secondary p-4 rounded-lg whitespace-pre-wrap">{error.message}</pre>
      <button onClick={resetErrorBoundary} className="btn-primary mt-6">
        Try again
      </button>
    </div>
  );
};

export default ErrorFallback;
