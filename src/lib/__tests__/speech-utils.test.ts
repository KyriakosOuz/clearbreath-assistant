
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speakText, stopSpeaking } from '../speech-utils';

describe('speech-utils', () => {
  beforeEach(() => {
    // Mock SpeechSynthesis
    const mockSpeak = vi.fn();
    const mockCancel = vi.fn();
    const mockGetVoices = vi.fn().mockReturnValue([
      { lang: 'en-US', name: 'Female Voice' }
    ]);

    Object.defineProperty(window, 'speechSynthesis', {
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices
      },
      writable: true
    });
  });

  it('creates utterance with correct properties', () => {
    const text = 'Test text';
    const utterance = speakText(text);
    
    expect(utterance).toBeTruthy();
    if (utterance) {
      expect(utterance.text).toBe(text);
      expect(utterance.rate).toBe(1.0);
      expect(utterance.pitch).toBe(1.0);
      expect(utterance.volume).toBe(1.0);
    }
  });

  it('handles missing speechSynthesis', () => {
    // Remove speechSynthesis
    Object.defineProperty(window, 'speechSynthesis', {
      value: undefined,
      writable: true
    });

    const utterance = speakText('Test');
    expect(utterance).toBeNull();
  });

  it('stops speaking when called', () => {
    stopSpeaking();
    expect(window.speechSynthesis.cancel).toHaveBeenCalled();
  });
});
