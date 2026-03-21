import React, { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.jsx';
import Sidebar from './Sidebar.jsx';
import ContentArea from './ContentArea.jsx';
import ChatPanel from '../chat/ChatPanel.jsx';

import tokens from '../../theme/tokens.js';
import { ActiveTabProvider } from '../../context/ActiveTabContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useReport } from '../../hooks/useReport.js';
import { generatePageAnalysis } from '../../utils/chatHelpers.js';

function RouteAnalyzer() {
  const location = useLocation();
  const { isOpen, openWithMessage } = useChat();
  const { report } = useReport();
  const prevPath = useRef(null);

  useEffect(() => {
    if (!isOpen || !report || location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;
    const analysis = generatePageAnalysis(report, location.pathname);
    if (analysis) openWithMessage(analysis);
  }, [location.pathname, isOpen, report, openWithMessage]);

  return null;
}

export default function AppLayout() {
  return (
    <ActiveTabProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: tokens.colors.background }}>
        <Header />
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar />
          <ContentArea>
            <RouteAnalyzer />
            <Outlet />
          </ContentArea>
        </div>
        <ChatPanel />
      </div>
    </ActiveTabProvider>
  );
}
