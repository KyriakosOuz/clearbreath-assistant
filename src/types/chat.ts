
export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export const generateId = (): string => Math.random().toString(36).substring(2, 10);

export const SUGGESTED_QUESTIONS = [
  "Is it safe to jog today with the current air quality?",
  "What are the effects of PM2.5 on my respiratory system?",
  "How can I protect my children from air pollution?",
  "What air purifier type is best for wildfire smoke?",
  "When should I wear a mask outdoors?"
];
