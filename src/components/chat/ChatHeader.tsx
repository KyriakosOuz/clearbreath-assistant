
import { Bot, Volume2, VolumeX, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  isVoiceEnabled: boolean;
  onVoiceToggle: () => void;
  onClearChat: () => void;
}

const ChatHeader = ({ isVoiceEnabled, onVoiceToggle, onClearChat }: ChatHeaderProps) => {
  return (
    <div className="border-b p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-medium">Air Quality Assistant</h3>
          <p className="text-xs text-muted-foreground">Powered by Mistral AI</p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onVoiceToggle}
          className="h-8 w-8"
        >
          {isVoiceEnabled ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClearChat}
          className="h-8 w-8"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
