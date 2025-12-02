'use client';

import { useEffect, useRef } from 'react';
import type { Message } from '@/types/message';
import { formatTimestamp } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  currentUserName: string;
}

export function MessageList({ messages, currentUserName }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-text-muted text-center">
          No messages yet. Be the first to send a message!
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const isOwnMessage = message.senderName === currentUserName;
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const isGrouped = prevMessage && prevMessage.senderName === message.senderName;

        return (
          <div
            key={message.id}
            className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
          >
            {!isGrouped && (
              <div className={`text-sm font-medium mb-1 px-1 ${isOwnMessage ? 'text-primary' : 'text-text-secondary'}`}>
                {isOwnMessage ? 'You' : message.senderName}
              </div>
            )}
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                isOwnMessage
                  ? 'bg-primary text-white'
                  : 'bg-bg-secondary text-text-primary'
              }`}
            >
              <p className="break-words whitespace-pre-wrap">{message.content}</p>
              <div className={`text-xs mt-1 ${isOwnMessage ? 'text-white/70' : 'text-text-muted'}`}>
                {formatTimestamp(message.timestamp)}
                {message.status === 'sending' && ' • Sending...'}
                {message.status === 'failed' && ' • Failed'}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
