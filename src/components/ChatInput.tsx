
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PaperclipIcon, SendIcon, XIcon, Loader2Icon } from 'lucide-react';
import { Attachment } from '@/types/chat';
import { toast } from '@/hooks/use-toast';
import AttachmentPreview from './AttachmentPreview';

interface ChatInputProps {
  onSendMessage: (message: string, attachments: Attachment[]) => void;
  isLoading?: boolean;
}

const ChatInput = ({ onSendMessage, isLoading = false }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() || attachments.length > 0) {
        handleSendMessage();
      }
    }
  };
  
  const handleSendMessage = () => {
    if (isLoading) return;
    
    if (message.trim() || attachments.length > 0) {
      onSendMessage(message, attachments);
      setMessage('');
      setAttachments([]);
    }
  };
  
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const allowedTypes = ['application/pdf'];
    const newAttachments: Attachment[] = [];
    
    Array.from(files).forEach(file => {
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Only PDF files are supported.",
          variant: "destructive"
        });
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB.",
          variant: "destructive"
        });
        return;
      }
      
      const attachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file),
        size: file.size
      };
      
      newAttachments.push(attachment);
    });
    
    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const filtered = prev.filter(att => att.id !== id);
      const removed = prev.find(att => att.id === id);
      
      if (removed && removed.url.startsWith('blob:')) {
        URL.revokeObjectURL(removed.url);
      }
      
      return filtered;
    });
  };
  
  return (
    <div className="chat-input-container glass-panel border-t border-border rounded-t-lg">
      {attachments.length > 0 && (
        <div className="p-3 space-y-2 border-b border-border">
          {attachments.map(attachment => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={() => removeAttachment(attachment.id)}
              showRemove
            />
          ))}
        </div>
      )}
      
      <div className="p-3">
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="resize-none min-h-[60px] max-h-[200px] focus-visible:ring-1 border-muted"
          disabled={isLoading}
        />
        
        <div className="flex justify-between items-center mt-2">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf"
              multiple
            />
            <Button
              variant="outline"
              size="icon"
              type="button"
              onClick={handleFileClick}
              disabled={isLoading}
              className="button-hover-effect"
            >
              <PaperclipIcon size={18} />
            </Button>
          </div>
          
          <Button
            type="button"
            onClick={handleSendMessage}
            disabled={!message.trim() && attachments.length === 0 || isLoading}
            className="button-hover-effect"
          >
            {isLoading ? (
              <Loader2Icon className="animate-spin" size={18} />
            ) : (
              <SendIcon size={18} />
            )}
            <span className="ml-2">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
