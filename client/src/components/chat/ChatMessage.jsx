import React from 'react';
import tokens from '../../theme/tokens.js';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  const containerStyle = {
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    marginBottom: tokens.spacing.md,
  };

  const bubbleStyle = {
    maxWidth: '85%',
    padding: `${tokens.spacing.md}px ${tokens.spacing.lg}px`,
    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    backgroundColor: isUser ? tokens.colors.primary : tokens.colors.borderLight,
    color: isUser ? tokens.colors.white : tokens.colors.text,
    fontSize: tokens.typography.fontSize.md,
    lineHeight: tokens.typography.lineHeight.normal,
    boxShadow: tokens.shadows.sm,
    wordBreak: 'break-word',
  };

  const avatarStyle = {
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.semibold,
    flexShrink: 0,
    marginRight: isUser ? 0 : tokens.spacing.sm,
    marginLeft: isUser ? tokens.spacing.sm : 0,
    backgroundColor: isUser ? tokens.colors.primary : tokens.colors.border,
    color: isUser ? tokens.colors.white : tokens.colors.textSecondary,
  };

  const wrapperStyle = {
    display: 'flex',
    alignItems: 'flex-end',
    flexDirection: isUser ? 'row-reverse' : 'row',
  };

  const parseInlineMarkdown = (text) => {
    if (!text) return text;

    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^(\*\*|__)(.+?)\1/);
      if (boldMatch) {
        parts.push(<strong key={key++}>{parseInlineMarkdown(boldMatch[2])}</strong>);
        remaining = remaining.slice(boldMatch[0].length);
        continue;
      }

      const italicMatch = remaining.match(/^(\*|_)([^*_]+?)\1(?![a-zA-Z])/);
      if (italicMatch) {
        parts.push(<em key={key++}>{parseInlineMarkdown(italicMatch[2])}</em>);
        remaining = remaining.slice(italicMatch[0].length);
        continue;
      }

      const codeMatch = remaining.match(/^`([^`]+)`/);
      if (codeMatch) {
        parts.push(
          <code key={key++} style={{
            backgroundColor: tokens.colors.border,
            padding: '2px 6px',
            borderRadius: tokens.radii.sm,
            fontSize: tokens.typography.fontSize.sm,
            fontFamily: 'monospace',
          }}>
            {codeMatch[1]}
          </code>
        );
        remaining = remaining.slice(codeMatch[0].length);
        continue;
      }

      const nextSpecial = remaining.slice(1).search(/[\*_`]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      } else {
        parts.push(remaining.slice(0, nextSpecial + 1));
        remaining = remaining.slice(nextSpecial + 1);
      }
    }

    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
  };

  const formatContent = (content) => {
    if (!content) return null;

    const lines = content.split('\n');
    const elements = [];
    let listItems = [];
    let listType = null;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'ul') {
          elements.push(
            <ul key={elements.length} style={{ margin: `${tokens.spacing.sm}px 0`, paddingLeft: 20 }}>
              {listItems}
            </ul>
          );
        } else {
          elements.push(
            <ol key={elements.length} style={{ margin: `${tokens.spacing.sm}px 0`, paddingLeft: 20 }}>
              {listItems}
            </ol>
          );
        }
        listItems = [];
        listType = null;
      }
    };

    lines.forEach((line, i) => {
      const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headerMatch) {
        flushList();
        const level = headerMatch[1].length;
        const fontSize = level === 1 ? tokens.typography.fontSize.xl : level === 2 ? tokens.typography.fontSize.lg : tokens.typography.fontSize.md;
        elements.push(
          <div key={i} style={{ fontWeight: tokens.typography.fontWeight.semibold, fontSize, marginTop: tokens.spacing.md, marginBottom: tokens.spacing.xs }}>
            {parseInlineMarkdown(headerMatch[2])}
          </div>
        );
        return;
      }

      const bulletMatch = line.match(/^[\-\*•]\s+(.+)$/);
      if (bulletMatch) {
        if (listType !== 'ul') {
          flushList();
          listType = 'ul';
        }
        listItems.push(<li key={i}>{parseInlineMarkdown(bulletMatch[1])}</li>);
        return;
      }

      const numberedMatch = line.match(/^\d+[\.\)]\s+(.+)$/);
      if (numberedMatch) {
        if (listType !== 'ol') {
          flushList();
          listType = 'ol';
        }
        listItems.push(<li key={i}>{parseInlineMarkdown(numberedMatch[1])}</li>);
        return;
      }

      flushList();
      if (line.trim() === '') {
        elements.push(<div key={i} style={{ height: tokens.spacing.sm }} />);
      } else {
        elements.push(<div key={i}>{parseInlineMarkdown(line)}</div>);
      }
    });

    flushList();
    return elements;
  };

  return (
    <div style={containerStyle}>
      <div style={wrapperStyle}>
        <div style={avatarStyle}>
          {isUser ? 'Du' : 'KI'}
        </div>
        <div style={bubbleStyle}>
          {formatContent(message.content) || (
            <span style={{ opacity: 0.5 }}>...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
