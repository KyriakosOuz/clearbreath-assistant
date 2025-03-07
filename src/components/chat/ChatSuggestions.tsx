
import { Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SUGGESTED_QUESTIONS } from '@/types/chat';

interface ChatSuggestionsProps {
  onSuggestionClick: (question: string) => void;
}

const ChatSuggestions = ({ onSuggestionClick }: ChatSuggestionsProps) => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center p-8">
      <Bot className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">Air Quality Assistant</h3>
      <p className="text-muted-foreground mb-6">
        Ask questions about air quality, pollution effects, and health recommendations
      </p>
      <div className="grid grid-cols-1 gap-2 w-full max-w-md">
        {SUGGESTED_QUESTIONS.map((question, index) => (
          <Button 
            key={index} 
            variant="outline" 
            className="justify-start text-left h-auto py-2"
            onClick={() => onSuggestionClick(question)}
          >
            {question}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default ChatSuggestions;
