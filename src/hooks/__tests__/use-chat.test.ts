
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useChat } from '../use-chat';

// Mock supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    functions: {
      invoke: vi.fn().mockResolvedValue({
        data: { reply: 'Test response' },
        error: null
      })
    }
  }
}));

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty messages and input', () => {
    const { result } = renderHook(() => useChat());
    
    expect(result.current.messages).toHaveLength(1); // Initial greeting
    expect(result.current.inputValue).toBe('');
    expect(result.current.isLoading).toBe(false);
  });

  it('updates input value', () => {
    const { result } = renderHook(() => useChat());
    
    act(() => {
      result.current.setInputValue('test message');
    });
    
    expect(result.current.inputValue).toBe('test message');
  });

  it('toggles voice enablement', () => {
    const { result } = renderHook(() => useChat());
    
    act(() => {
      result.current.handleVoiceToggle();
    });
    
    expect(result.current.isVoiceEnabled).toBe(false);
  });

  it('clears chat history', () => {
    const { result } = renderHook(() => useChat());
    
    act(() => {
      result.current.clearChat();
    });
    
    expect(result.current.messages).toHaveLength(1); // Only greeting remains
  });
});
