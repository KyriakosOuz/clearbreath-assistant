
import { motion } from 'framer-motion';
import { VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SpeakingIndicatorProps {
  onStopSpeaking: () => void;
}

const SpeakingIndicator = ({ onStopSpeaking }: SpeakingIndicatorProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 flex items-center gap-2 text-xs"
    >
      <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          animate={{ width: ['0%', '100%', '0%'] }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5,
            ease: "linear" 
          }}
        />
      </div>
      <span className="text-muted-foreground">Speaking...</span>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onStopSpeaking} 
        className="h-6 w-6 ml-auto"
      >
        <VolumeX className="h-3 w-3" />
      </Button>
    </motion.div>
  );
};

export default SpeakingIndicator;
