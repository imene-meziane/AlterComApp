import React from 'react';

function LoadingScreen({ message = 'Chargement...' }) {
  return (
    <div className="loading-screen">
      <div className="loading-screen__card">
        <div className="loading-dot" aria-hidden="true" />
        <p>{message}</p>
      </div>
    </div>
  );
}

export default LoadingScreen;
