import React from 'react';
import ReactDOM from 'react-dom';

import AlterComApp from './altercom/AlterComApp';
import './index.css';

// Import debug utilities
import './api/debugAuth';

ReactDOM.render(<AlterComApp />, document.getElementById('root'));
