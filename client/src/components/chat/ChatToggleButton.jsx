import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import tokens from '../../theme/tokens.js';

const ChatToggleButton = () => {
  const { isOpen, openChat } = useChat();

  if (isOpen) return null;

  const ChatIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );

  return (
    <button
      onClick={openChat}
      title="KI-Assistent öffnen"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: '50%',
        border: 'none',
        backgroundColor: tokens.colors.primary,
        color: tokens.colors.white,
        cursor: 'pointer',
        boxShadow: `0 4px 12px rgba(11, 61, 44, 0.4)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        zIndex: 100,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.boxShadow = '0 6px 16px rgba(11, 61, 44, 0.5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(11, 61, 44, 0.4)';
      }}
    >
      <ChatIcon />
    </button>
  );
};

export default ChatToggleButton;
