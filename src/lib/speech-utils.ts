
/**
 * Utility functions for speech synthesis
 */

export const speakText = (text: string): SpeechSynthesisUtterance | null => {
  if (!window.speechSynthesis) return null;
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;
  
  // Find a good voice for English
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(voice => 
    voice.lang.includes('en') && voice.name.includes('Female')
  );
  
  if (englishVoice) {
    utterance.voice = englishVoice;
  }
  
  window.speechSynthesis.speak(utterance);
  return utterance;
};

export const stopSpeaking = (): void => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
