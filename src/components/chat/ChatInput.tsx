
import { Send, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  isLoading: boolean;
  isRecording?: boolean;
  onSendMessage: () => void;
  onRecordingToggle?: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const ChatInput = ({
  inputValue,
  setInputValue,
  isLoading,
  isRecording = false,
  onSendMessage,
  onRecordingToggle,
  onKeyDown
}: ChatInputProps) => {
  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onRecordingToggle}
          className="shrink-0"
        >
          {isRecording ? (
            <MicOff className="h-4 w-4 text-red-500" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
        
        <Input
          placeholder="Ask about air quality and health..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading}
          className="flex-1"
        />
        
        <Button
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isLoading}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
