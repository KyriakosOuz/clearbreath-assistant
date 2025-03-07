
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatInput from '../ChatInput';

describe('ChatInput', () => {
  const defaultProps = {
    inputValue: '',
    setInputValue: () => {},
    isLoading: false,
    onSendMessage: () => {},
    onRecordingToggle: () => {},
    onKeyDown: () => {},
  };

  it('renders input field and buttons', () => {
    render(<ChatInput {...defaultProps} />);
    expect(screen.getByPlaceholderText(/ask about air quality/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /voice/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('updates input value', () => {
    const setInputValue = vi.fn();
    render(<ChatInput {...defaultProps} setInputValue={setInputValue} />);
    
    const input = screen.getByPlaceholderText(/ask about air quality/i);
    fireEvent.change(input, { target: { value: 'test message' } });
    expect(setInputValue).toHaveBeenCalledWith('test message');
  });

  it('disables send button when input is empty', () => {
    render(<ChatInput {...defaultProps} inputValue="" />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('disables input and buttons when loading', () => {
    render(<ChatInput {...defaultProps} isLoading={true} />);
    expect(screen.getByPlaceholderText(/ask about air quality/i)).toBeDisabled();
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });
});
