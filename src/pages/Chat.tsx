
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'
import AnimatedBackground from '@/components/AnimatedBackground'
import AQChat from '@/components/AQChat'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'

const Chat = () => {
  return (
    <AnimatedBackground intensity="light">
      <div className="page-container">
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-2xl font-bold"
          >
            Air Quality Assistant
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-5 w-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-medium">About the AI Assistant</h4>
                  <p className="text-sm text-muted-foreground">
                    The AetherIQ assistant uses Mistral AI to answer your questions about air quality, 
                    pollution health effects, and safety recommendations.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ask about specific pollutants, health conditions, or how to protect yourself 
                    during poor air quality days.
                  </p>
                </div>
              </PopoverContent>
            </Popover>
          </motion.div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-[calc(100vh-12rem)]"
        >
          <AQChat />
        </motion.div>
      </div>
    </AnimatedBackground>
  )
}

export default Chat
