
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChatSuggestions from '../ChatSuggestions';
import { SUGGESTED_QUESTIONS } from '@/types/chat';

describe('ChatSuggestions', () => {
  it('renders all suggested questions', () => {
    render(<ChatSuggestions onSuggestionClick={() => {}} />);
    
    SUGGESTED_QUESTIONS.forEach(question => {
      expect(screen.getByText(question)).toBeInTheDocument();
    });
  });

  it('calls onSuggestionClick with selected question', () => {
    const onSuggestionClick = vi.fn();
    render(<ChatSuggestions onSuggestionClick={onSuggestionClick} />);
    
    const firstQuestion = SUGGESTED_QUESTIONS[0];
    fireEvent.click(screen.getByText(firstQuestion));
    expect(onSuggestionClick).toHaveBeenCalledWith(firstQuestion);
  });
});
