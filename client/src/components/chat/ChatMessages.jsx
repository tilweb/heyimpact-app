import React, { useEffect, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useChatApi } from '../../hooks/useChatApi.js';
import ChatMessage from './ChatMessage.jsx';
import tokens from '../../theme/tokens.js';

const ChatMessages = () => {
  const { messages, isLoading } = useChat();
  const { sendMessage } = useChatApi();

  const suggestions = [
    'Welche Daten fehlen noch im Bericht?',
    'Fasse den aktuellen Stand zusammen',
    'Was sind die wesentlichen Themen?',
  ];
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const containerStyle = {
    flex: 1,
    overflowY: 'auto',
    padding: tokens.spacing.lg,
    display: 'flex',
    flexDirection: 'column',
  };

  const emptyStateStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: tokens.colors.textSecondary,
    textAlign: 'center',
    padding: tokens.spacing.xxl,
  };

  if (messages.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={emptyStateStyle}>
          <div style={{ fontSize: 48, marginBottom: tokens.spacing.lg, opacity: 0.5 }}>💬</div>
          <div style={{ fontSize: tokens.typography.fontSize.xl, fontWeight: tokens.typography.fontWeight.semibold, marginBottom: tokens.spacing.sm, color: tokens.colors.text }}>
            Berichts-Assistent
          </div>
          <div style={{ fontSize: tokens.typography.fontSize.md, lineHeight: tokens.typography.lineHeight.normal, maxWidth: 280 }}>
            Stellen Sie Fragen zu Ihrem Nachhaltigkeitsbericht oder lassen Sie sich beim Erstellen helfen.
          </div>
          <div style={{ marginTop: tokens.spacing.xxl, display: 'flex', flexDirection: 'column', gap: tokens.spacing.sm, width: '100%', maxWidth: 280 }}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => sendMessage(suggestion)}
                style={{
                  padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
                  backgroundColor: tokens.colors.surfaceHover,
                  borderRadius: tokens.radii.sm,
                  fontSize: tokens.typography.fontSize.sm,
                  color: tokens.colors.textSecondary,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background-color 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = tokens.colors.border}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = tokens.colors.surfaceHover}
              >
                {suggestion}
              </div>
            ))}
          </div>
          <div style={{
            marginTop: tokens.spacing.xl,
            padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
            backgroundColor: tokens.colors.warningLight,
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.xs,
            lineHeight: tokens.typography.lineHeight.normal,
            color: '#92400e',
            maxWidth: 300,
            textAlign: 'left',
          }}>
            <strong>Hinweis:</strong> Die Antworten werden durch KI generiert und können Fehler enthalten. Bitte verifizieren Sie wichtige Informationen.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle} ref={containerRef}>
      {messages.map((message, index) => (
        <ChatMessage key={index} message={message} />
      ))}
      {isLoading && messages[messages.length - 1]?.content === '' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          padding: `${tokens.spacing.sm}px ${tokens.spacing.lg}px`,
          color: tokens.colors.textSecondary,
          fontSize: tokens.typography.fontSize.sm,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tokens.colors.primary, animation: 'chatPulse 1.4s infinite ease-in-out', animationDelay: '0s' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tokens.colors.primary, animation: 'chatPulse 1.4s infinite ease-in-out', animationDelay: '0.2s' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: tokens.colors.primary, animation: 'chatPulse 1.4s infinite ease-in-out', animationDelay: '0.4s' }} />
          <span style={{ marginLeft: tokens.spacing.xs }}>Denkt nach...</span>
        </div>
      )}
      <div ref={messagesEndRef} />
      <style>
        {`
          @keyframes chatPulse {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </div>
  );
};

export default ChatMessages;
