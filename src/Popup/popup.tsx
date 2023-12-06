import React from 'react';
import ReactDOM from 'react-dom/client';
import PopupComponent from './PopupComponent';
import { CustomStyleProvider } from '../Contexts/CustomStyleContext';


import i18next from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { config } from '../Localization/config';


i18next.init(config);

ReactDOM.createRoot(document.getElementById('popup-root') as HTMLElement).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18next}>
      <CustomStyleProvider>
        <PopupComponent />
      </CustomStyleProvider>
    </I18nextProvider>
  </React.StrictMode>
);
