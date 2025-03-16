
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRightIcon } from 'lucide-react';
import ChatInput from '@/components/ChatInput';
import ChatMessage from '@/components/ChatMessage';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { Attachment, ChatMessage as ChatMessageType, GeminiMessage } from '@/types/chat';
import {
  getActiveConversation,
  createConversation,
  addMessage,
  setActiveConversation,
  storeAttachment
} from '@/utils/chatStorage';
import { getGeminiResponse, convertChatToGeminiMessages } from '@/utils/geminiApi';

const Index = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  useEffect(() => {
    // Initialize or load active conversation
    const activeConversation = getActiveConversation();
    
    if (activeConversation) {
      setMessages(activeConversation.messages);
      setConversationId(activeConversation.id);
    } else {
      handleNewConversation();
    }
    
    // Set sidebar default state based on screen size
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, attachments: Attachment[]) => {
    if (!conversationId) {
      const newConversation = createConversation();
      setConversationId(newConversation.id);
    }
    
    // Store attachments with file data
    const storedAttachments = await Promise.all(
      attachments.map(async (attachment) => {
        return await storeAttachment(attachment);
      })
    );
    
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: Date.now(),
      attachments: storedAttachments.length > 0 ? storedAttachments : undefined,
      userName: user?.name
    };
    
    // Add user message to the conversation
    addMessage(conversationId!, userMessage);
    setMessages(prev => [...prev, userMessage]);
    
    // Process with Gemini API
    setIsLoading(true);
    
    try {
      // Convert previous messages to Gemini format (excluding attachments for simplicity)
      const previousMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const geminiMessages = convertChatToGeminiMessages(previousMessages);
      
      const response = await getGeminiResponse(content, storedAttachments, geminiMessages);
      
      const assistantMessage: ChatMessageType = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };
      
      // Add assistant message to the conversation
      addMessage(conversationId!, assistantMessage);
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate a response. Please try again.",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = (userMessage: string): string => {
    // Simple response generation for demonstration
    const responses = [
      "I understand your question about this topic. Let me explain in more detail...",
      "That's an interesting point. Here's what I think about it...",
      "I've analyzed your request and here's what I found...",
      "Based on the information you've provided, I would suggest...",
      "Thanks for sharing. From my perspective, I would consider..."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)] + 
           " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";
  };

  const handleNewConversation = () => {
    const newConversation = createConversation();
    setConversationId(newConversation.id);
    setMessages([]);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    const conversation = getActiveConversation();
    if (conversation) {
      setMessages(conversation.messages);
      setConversationId(conversation.id);
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background">
      <Header />
      
      <div className="flex flex-1 h-[calc(100vh-4rem)] mt-16">
        {/* Sidebar */}
        <Sidebar
          activeConversationId={conversationId}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
        />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Desktop sidebar toggle */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="fixed top-20 left-4 z-10"
            >
              <ChevronRightIcon
                size={20}
                className={`transform transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
              />
            </Button>
          )}
          
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto pb-32">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-4">
                <div className="max-w-md text-center space-y-4">
                  <h1 className="text-3xl font-bold tracking-tight">LegalGist Assistant</h1>
                  <p className="text-muted-foreground">
                    Ask me anything about legal documents or upload a PDF document for assistance. All conversations and documents are stored locally in your browser.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id} 
                    message={message} 
                    index={index}
                    totalMessages={messages.length}
                  />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
          
          {/* Input container - fixed at the bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-4 mx-auto max-w-3xl w-full">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
