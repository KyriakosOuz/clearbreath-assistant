
import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Mic, MicOff, Volume2, VolumeX, User, Bot, Trash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

type MessageRole = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
}

const generateId = (): string => Math.random().toString(36).substring(2, 10)

const SUGGESTED_QUESTIONS = [
  "Is it safe to jog today with the current air quality?",
  "What are the effects of PM2.5 on my respiratory system?",
  "How can I protect my children from air pollution?",
  "What air purifier type is best for wildfire smoke?",
  "When should I wear a mask outdoors?"
]

const AQChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }
  
  useEffect(() => {
    scrollToBottom()
  }, [messages])
  
  // Add initial greeting from the assistant
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: generateId(),
        role: 'assistant',
        content: "Hello! I'm your air quality and health assistant. Ask me anything about air pollution, its health effects, or how to stay safe in different air quality conditions.",
        timestamp: new Date()
      }])
    }
  }, [messages.length])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    
    try {
      // Format conversation history for the API
      const messageHistory = messages
        .concat(userMessage)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      
      // Send request to Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('mistral-chat', {
        body: {
          messages: messageHistory,
          systemPrompt: "You are AetherIQ's air quality and health expert. Answer questions about air pollution, its health effects, prevention measures, and safety recommendations. Include relevant AQI values and pollutant thresholds when appropriate. Keep responses concise, practical, and science-based. Current date: " + new Date().toLocaleDateString()
        }
      })
      
      if (error) throw new Error(error.message)
      
      // Add assistant response to chat
      const assistantMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Read response aloud if voice is enabled
      if (isVoiceEnabled) {
        speakText(data.reply)
      }
      
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const speakText = (text: string) => {
    if (!window.speechSynthesis) return
    
    setIsSpeaking(true)
    
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
    // Find a good voice for English
    const voices = window.speechSynthesis.getVoices()
    const englishVoice = voices.find(voice => 
      voice.lang.includes('en') && voice.name.includes('Female')
    )
    
    if (englishVoice) {
      utterance.voice = englishVoice
    }
    
    utterance.onend = () => {
      setIsSpeaking(false)
    }
    
    window.speechSynthesis.speak(utterance)
  }
  
  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }
  
  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking()
    }
    setIsVoiceEnabled(prev => !prev)
  }
  
  const handleRecording = () => {
    // For future implementation of voice input
    toast({
      title: "Coming Soon",
      description: "Voice input will be available in a future update.",
    })
  }
  
  const clearChat = () => {
    stopSpeaking()
    setMessages([])
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  const useSuggestedQuestion = (question: string) => {
    setInputValue(question)
  }
  
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white/90 shadow-lg overflow-hidden">
      {/* Chat header */}
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
            onClick={toggleVoice}
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
            onClick={clearChat}
            className="h-8 w-8"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
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
                  onClick={() => useSuggestedQuestion(question)}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "flex items-start gap-3 max-w-[85%]",
                message.role === 'user' ? "ml-auto" : "mr-auto"
              )}
            >
              <div 
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  message.role === 'user' 
                    ? "bg-primary/10 order-2" 
                    : "bg-muted order-1"
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-primary" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div 
                className={cn(
                  "rounded-lg px-4 py-3 text-sm",
                  message.role === 'user' 
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
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handleRecording}
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
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="flex-1"
          />
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {isSpeaking && (
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
              onClick={stopSpeaking} 
              className="h-6 w-6 ml-auto"
            >
              <VolumeX className="h-3 w-3" />
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default AQChat
