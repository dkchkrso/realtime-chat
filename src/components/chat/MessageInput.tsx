'use client';

import { useState, useCallback, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export function MessageInput({ onSendMessage, disabled = false, maxLength = 1000 }: MessageInputProps) {
  const [content, setContent] = useState('');

  const handleSend = useCallback(() => {
    const trimmed = content.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setContent('');
  }, [content, disabled, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const characterCount = content.length;
  const isNearLimit = characterCount > maxLength * 0.9;
  const isOverLimit = characterCount > maxLength;

  return (
    <div className="border-t border-border p-4 bg-bg-primary">
      <div className="flex gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className="flex-1 resize-none rounded-lg border border-border bg-bg-secondary px-4 py-2 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ minHeight: '42px', maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={disabled || !content.trim() || isOverLimit}
          className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>
      {isNearLimit && (
        <div className={`text-xs mt-2 ${isOverLimit ? 'text-error' : 'text-warning'}`}>
          {characterCount}/{maxLength} characters
          {isOverLimit && ' - Message too long'}
        </div>
      )}
    </div>
  );
}
