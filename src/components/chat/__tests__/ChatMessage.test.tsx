
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ChatMessage from '../ChatMessage';

describe('ChatMessage', () => {
  const mockMessage = {
    id: '123',
    role: 'user' as const,
    content: 'Test message',
    timestamp: new Date()
  };

  it('renders user message correctly', () => {
    render(<ChatMessage message={mockMessage} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    const assistantMessage = { ...mockMessage, role: 'assistant' as const };
    render(<ChatMessage message={assistantMessage} />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('displays timestamp', () => {
    render(<ChatMessage message={mockMessage} />);
    const time = mockMessage.timestamp.toLocaleTimeString(undefined, { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    expect(screen.getByText(time)).toBeInTheDocument();
  });
});
