import { useCallback, useRef } from 'react';
import { useChat } from '../context/ChatContext.jsx';
import { useReport } from './useReport.js';
import { useAuth } from './useAuth.js';
import { generateSystemPrompt } from '../utils/chatHelpers.js';

const API_BASE_URL = '/api/chat';

export const useChatApi = () => {
  const { messages, addMessage, updateLastMessage, setIsLoading } = useChat();
  const { report } = useReport();
  const { token } = useAuth();
  const abortControllerRef = useRef(null);

  const sendMessage = useCallback(async (userMessage) => {
    if (!userMessage.trim()) return;

    addMessage({
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    });

    addMessage({
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    });

    setIsLoading(true);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const systemPrompt = generateSystemPrompt(report);

      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      chatHistory.push({
        role: 'user',
        content: userMessage,
      });

      const response = await fetch(`${API_BASE_URL}/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory,
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        throw new Error(`API request failed: ${response.status} - ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                assistantContent += content;
                updateLastMessage(assistantContent);
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }

      if (buffer.trim().startsWith('data: ')) {
        const data = buffer.trim().slice(6);
        if (data && data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              updateLastMessage(assistantContent);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Chat API error:', error);
      updateLastMessage('Entschuldigung, es gab einen Fehler bei der Verarbeitung Ihrer Anfrage. Bitte versuchen Sie es erneut.');
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [messages, report, token, addMessage, updateLastMessage, setIsLoading]);

  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return {
    sendMessage,
    cancelRequest,
  };
};
