
import { ChatMessage, Conversation, Attachment } from '../types/chat';

const STORAGE_KEY = 'chat-conversations';

interface ChatStorage {
  conversations: Conversation[];
  activeConversationId: string | null;
}

// Initialize storage
const initStorage = (): ChatStorage => {
  const defaultStorage: ChatStorage = {
    conversations: [],
    activeConversationId: null
  };
  
  try {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (!storedData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStorage));
      return defaultStorage;
    }
    return JSON.parse(storedData) as ChatStorage;
  } catch (error) {
    console.error('Failed to initialize chat storage:', error);
    return defaultStorage;
  }
};

// Save storage
const saveStorage = (storage: ChatStorage): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage));
  } catch (error) {
    console.error('Failed to save chat storage:', error);
  }
};

// Store attachment with file data
export const storeAttachment = async (attachment: Attachment): Promise<Attachment> => {
  if (attachment.type === 'application/pdf' && attachment.url.startsWith('blob:')) {
    try {
      // Fetch the blob data
      const response = await fetch(attachment.url);
      const blob = await response.blob();
      
      // Convert to base64
      const reader = new FileReader();
      const fileDataPromise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          resolve(base64data);
        };
      });
      
      reader.readAsDataURL(blob);
      const fileData = await fileDataPromise;
      
      // Store the file data in the attachment
      return {
        ...attachment,
        fileData
      };
    } catch (error) {
      console.error('Failed to store attachment data:', error);
    }
  }
  
  return attachment;
};

// Get all conversations
export const getConversations = (): Conversation[] => {
  const storage = initStorage();
  return storage.conversations;
};

// Get active conversation
export const getActiveConversation = (): Conversation | null => {
  const storage = initStorage();
  if (!storage.activeConversationId) return null;
  
  return storage.conversations.find(conv => conv.id === storage.activeConversationId) || null;
};

// Set active conversation
export const setActiveConversation = (conversationId: string): void => {
  const storage = initStorage();
  storage.activeConversationId = conversationId;
  saveStorage(storage);
};

// Create a new conversation
export const createConversation = (): Conversation => {
  const storage = initStorage();
  
  const newConversation: Conversation = {
    id: crypto.randomUUID(),
    title: 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  
  storage.conversations.unshift(newConversation);
  storage.activeConversationId = newConversation.id;
  saveStorage(storage);
  
  return newConversation;
};

// Add message to conversation
export const addMessage = (conversationId: string, message: ChatMessage): void => {
  const storage = initStorage();
  const conversation = storage.conversations.find(conv => conv.id === conversationId);
  
  if (!conversation) return;
  
  conversation.messages.push(message);
  conversation.updatedAt = Date.now();
  
  // Update conversation title based on first user message if it's still default
  if (conversation.title === 'New Chat' && message.role === 'user') {
    conversation.title = message.content.substring(0, 30) + (message.content.length > 30 ? '...' : '');
  }
  
  saveStorage(storage);
};

// Delete a conversation
export const deleteConversation = (conversationId: string): void => {
  const storage = initStorage();
  storage.conversations = storage.conversations.filter(conv => conv.id !== conversationId);
  
  if (storage.activeConversationId === conversationId) {
    storage.activeConversationId = storage.conversations.length > 0 ? storage.conversations[0].id : null;
  }
  
  saveStorage(storage);
};

// Clear all conversations
export const clearAllConversations = (): void => {
  const emptyStorage: ChatStorage = {
    conversations: [],
    activeConversationId: null
  };
  
  saveStorage(emptyStorage);
};
