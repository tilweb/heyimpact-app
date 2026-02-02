import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import ContentArea from './ContentArea.jsx';
import ChatPanel from '../chat/ChatPanel.jsx';

import tokens from '../../theme/tokens.js';
import { ActiveTabProvider } from '../../context/ActiveTabContext.jsx';

export default function AppLayout() {
  return (
    <ActiveTabProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: tokens.colors.background }}>
        <Header />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <ContentArea>
            <Outlet />
          </ContentArea>
        </div>
        <ChatPanel />
      </div>
    </ActiveTabProvider>
  );
}
