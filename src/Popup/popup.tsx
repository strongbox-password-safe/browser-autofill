import React from 'react';
import ReactDOM from 'react-dom/client';
import PopupComponent from './PopupComponent';

ReactDOM.createRoot(
  document.getElementById('popup-root') as HTMLElement
).render(
  <React.StrictMode>
    <PopupComponent />
  </React.StrictMode>
);
