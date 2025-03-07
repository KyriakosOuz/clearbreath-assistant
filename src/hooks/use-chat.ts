
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ChatMessage, generateId } from '@/types/chat';
import { speakText, stopSpeaking } from '@/lib/speech-utils';

export const useChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Add initial greeting from the assistant
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: "Hello! I'm your air quality and health assistant. Ask me anything about air pollution, its health effects, or how to stay safe in different air quality conditions.",
        timestamp: new Date()
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Format conversation history for the API
      const messageHistory = messages
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      
      // Send request to Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('mistral-chat', {
        body: {
          messages: messageHistory,
          systemPrompt: "You are AetherIQ's air quality and health expert. Answer questions about air pollution, its health effects, prevention measures, and safety recommendations. Include relevant AQI values and pollutant thresholds when appropriate. Keep responses concise, practical, and science-based. Current date: " + new Date().toLocaleDateString()
        }
      });
      
      if (error) throw new Error(error.message);
      
      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Read response aloud if voice is enabled
      if (isVoiceEnabled) {
        const utterance = speakText(data.reply);
        if (utterance) {
          setIsSpeaking(true);
          utterance.onend = () => {
            setIsSpeaking(false);
          };
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVoiceToggle = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setIsVoiceEnabled(prev => !prev);
    setIsSpeaking(false);
  };
  
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };
  
  const clearChat = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setMessages([]);
  };

  return {
    messages,
    inputValue,
    setInputValue,
    isLoading,
    isSpeaking,
    isVoiceEnabled,
    messagesEndRef,
    handleSendMessage,
    handleVoiceToggle,
    handleStopSpeaking,
    clearChat
  };
};
