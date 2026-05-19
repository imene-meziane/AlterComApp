import React from 'react';
import { Link } from 'react-router-dom';

function PageHeader({
  title,
  description,
  eyebrow,
  action = null,
  backTo = ''
}) {
  return (
    <header className="page-header">
      <div>
        {backTo ? (
          <Link className="page-header__back" to={backTo}>
            Retour
          </Link>
        ) : null}
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="page-header__description">{description}</p> : null}
      </div>
      {action ? <div className="page-header__action">{action}</div> : null}
    </header>
  );
}

export default PageHeader;
