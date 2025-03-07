
import { useToast } from '@/hooks/use-toast';
import { useChat } from '@/hooks/use-chat';
import ChatHeader from './chat/ChatHeader';
import ChatMessage from './chat/ChatMessage';
import ChatSuggestions from './chat/ChatSuggestions';
import ChatInput from './chat/ChatInput';
import SpeakingIndicator from './chat/SpeakingIndicator';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const AQChat = () => {
  const {
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
  } = useChat();
  
  const { toast } = useToast();
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleRecording = () => {
    toast({
      title: "Coming Soon",
      description: "Voice input will be available in a future update.",
    });
  };
  
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white/90 shadow-lg overflow-hidden">
      {/* Chat header */}
      <ChatHeader 
        isVoiceEnabled={isVoiceEnabled}
        onVoiceToggle={handleVoiceToggle}
        onClearChat={clearChat}
      />
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <ChatSuggestions onSuggestionClick={setInputValue} />
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 max-w-[85%] mr-auto"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex space-x-1 p-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70 [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/70"></div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div>
        <ChatInput 
          inputValue={inputValue}
          setInputValue={setInputValue}
          isLoading={isLoading}
          onSendMessage={handleSendMessage}
          onRecordingToggle={handleRecording}
          onKeyDown={handleKeyDown}
        />
        
        {isSpeaking && (
          <SpeakingIndicator onStopSpeaking={handleStopSpeaking} />
        )}
      </div>
    </div>
  );
};

export default AQChat;
