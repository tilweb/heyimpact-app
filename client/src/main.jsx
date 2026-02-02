import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ReportProvider } from './context/ReportContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import './theme/globalStyles.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReportProvider>
          <ChatProvider>
            <App />
          </ChatProvider>
        </ReportProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
