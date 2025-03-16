
import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/types/chat';
import { UserIcon, BotIcon } from 'lucide-react';
import AttachmentPreview from './AttachmentPreview';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: ChatMessageType;
  index: number;
  totalMessages: number;
}

const ChatMessage = ({ message, index, totalMessages }: ChatMessageProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (messageRef.current) {
      observer.observe(messageRef.current);
    }
    
    return () => observer.disconnect();
  }, []);
  
  const isUser = message.role === 'user';
  const animationOrder = totalMessages - index;
  
  return (
    <div 
      ref={messageRef}
      className={cn(
        "w-full py-8",
        isUser ? "bg-muted/30" : "bg-background"
      )}
      style={{ 
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="flex items-start gap-4">
          <div className={cn(
            "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
            isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
          )}>
            {isUser ? <UserIcon size={16} /> : <BotIcon size={16} />}
          </div>
          
          <div 
            className="flex-1 message-container"
            style={{ '--animation-order': animationOrder } as React.CSSProperties}
          >
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground mb-1">
                {isUser ? (message.userName || 'You') : 'LegalGist Assistant'}
              </span>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                {message.content}
              </div>
            </div>
            
            {message.attachments && message.attachments.length > 0 && (
              <div className="mt-3 space-y-3">
                {message.attachments.map((attachment) => (
                  <AttachmentPreview 
                    key={attachment.id}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
