
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType } from '@/types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 max-w-[85%]",
        isUser ? "ml-auto" : "mr-auto"
      )}
    >
      <div 
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser 
            ? "bg-primary/10 order-2" 
            : "bg-muted order-1"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-primary" />
        ) : (
          <Bot className="h-4 w-4" />
        )}
      </div>
      
      <div 
        className={cn(
          "rounded-lg px-4 py-3 text-sm",
          isUser 
            ? "bg-primary text-primary-foreground order-1" 
            : "bg-muted order-2"
        )}
      >
        {message.content}
        <div className="mt-1 text-xs opacity-70">
          {message.timestamp.toLocaleTimeString(undefined, { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
