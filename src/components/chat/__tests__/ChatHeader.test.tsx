
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatHeader from '../ChatHeader';

describe('ChatHeader', () => {
  it('renders title and subtitle', () => {
    render(
      <ChatHeader 
        isVoiceEnabled={true}
        onVoiceToggle={() => {}}
        onClearChat={() => {}}
      />
    );
    
    expect(screen.getByText('Air Quality Assistant')).toBeInTheDocument();
    expect(screen.getByText('Powered by Mistral AI')).toBeInTheDocument();
  });

  it('toggles voice when button is clicked', () => {
    const onVoiceToggle = vi.fn();
    render(
      <ChatHeader 
        isVoiceEnabled={true}
        onVoiceToggle={onVoiceToggle}
        onClearChat={() => {}}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /toggle voice/i }));
    expect(onVoiceToggle).toHaveBeenCalled();
  });

  it('clears chat when clear button is clicked', () => {
    const onClearChat = vi.fn();
    render(
      <ChatHeader 
        isVoiceEnabled={true}
        onVoiceToggle={() => {}}
        onClearChat={onClearChat}
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    expect(onClearChat).toHaveBeenCalled();
  });
});
