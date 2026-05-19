import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="loading-screen">
      <div className="loading-screen__card">
        <p className="eyebrow">Page introuvable</p>
        <h1>Cette page n'existe pas.</h1>
        <Link className="primary-button" to="/">
          Revenir a AlterCom
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
