import React, { useEffect, useState } from 'react';

function PictogramTile({ item, onClick, variant = 'default' }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [item.imageUrl]);

  return (
    <button
      className={`pictogram-tile pictogram-tile--${variant}`}
      onClick={() => onClick(item)}
      style={{ '--tile-accent': item.color || '#6c9f8e' }}
      type="button"
    >
      <div className="pictogram-tile__media">
        {!hasError && item.imageUrl ? (
          <img
            alt=""
            className="pictogram-tile__image"
            onError={() => setHasError(true)}
            src={item.imageUrl}
          />
        ) : (
          <span className="pictogram-tile__fallback" aria-hidden="true">
            {item.label.slice(0, 1)}
          </span>
        )}
      </div>
      <div className="pictogram-tile__body">
        <strong>{item.label}</strong>
        <p>{item.phrase}</p>
      </div>
    </button>
  );
}

export default PictogramTile;
