
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { KeyIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

// Local storage key for the API key
const API_KEY_STORAGE_KEY = 'gemini-api-key';

const ApiKeyForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive"
      });
      return;
    }
    
    // Store in localStorage
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    
    toast({
      title: "Success",
      description: "API key saved successfully"
    });
    
    setIsOpen(false);
  };

  return (
   <>
   </>
  )
};

export function getGeminiApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export default ApiKeyForm;
