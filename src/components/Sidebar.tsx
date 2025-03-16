
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2Icon, MenuIcon, XIcon } from 'lucide-react';
import { Conversation } from '@/types/chat';
import { getConversations, createConversation, deleteConversation, setActiveConversation } from '@/utils/chatStorage';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface SidebarProps {
  activeConversationId: string | null;
  onNewConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar = ({ activeConversationId, onNewConversation, onSelectConversation, isOpen, onToggle }: SidebarProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    setConversations(getConversations());
  }, [activeConversationId]);

  const handleNewChat = () => {
    onNewConversation();
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversation(conversationId);
    onSelectConversation(conversationId);
    if (isMobile) {
      onToggle();
    }
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    deleteConversation(conversationId);
    setConversations(getConversations());
    toast({
      title: "Conversation deleted",
      description: "The conversation has been permanently removed.",
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 
    bg-sidebar transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    ${isMobile ? 'shadow-xl' : ''}
    flex flex-col h-full
  `;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-20 animate-fade-in"
          onClick={onToggle}
        />
      )}
      
      <aside className={sidebarClasses}>
        <div className="p-4 flex justify-between items-center border-b border-sidebar-border">
          <h2 className="text-lg font-semibold text-sidebar-foreground">Conversations</h2>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onToggle} className="text-sidebar-foreground">
              <XIcon size={20} />
            </Button>
          )}
        </div>
        
        <div className="p-3">
          <Button 
            onClick={handleNewChat} 
            className="w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 button-hover-effect"
          >
            <PlusIcon size={16} className="mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          {conversations.length === 0 ? (
            <div className="text-sidebar-foreground/70 text-center p-4 text-sm">
              No conversations yet
            </div>
          ) : (
            <ul className="space-y-1">
              {conversations.map((conversation) => (
                <li 
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation.id)}
                  className={`
                    rounded-md px-3 py-2 text-sm cursor-pointer flex justify-between items-center
                    ${activeConversationId === conversation.id 
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}
                  `}
                >
                  <div className="overflow-hidden">
                    <div className="truncate font-medium">{conversation.title}</div>
                    <div className="text-xs opacity-70">{formatDate(conversation.updatedAt)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-60 hover:opacity-100 h-7 w-7"
                    onClick={(e) => handleDeleteConversation(e, conversation.id)}
                  >
                    <Trash2Icon size={14} />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs text-sidebar-foreground/70 text-center">
            All chats are stored locally in your browser
          </div>
        </div>
      </aside>
      
      {/* Toggle button for mobile */}
      {isMobile && !isOpen && (
        <Button 
          variant="outline" 
          size="icon" 
          onClick={onToggle}
          className="fixed top-4 left-4 z-10 bg-background/80 backdrop-blur-sm"
        >
          <MenuIcon size={20} />
        </Button>
      )}
    </>
  );
};

export default Sidebar;
