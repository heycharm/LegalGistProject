import { Attachment, GeminiMessage, GeminiRequest, GeminiResponse } from '@/types/chat';
import { toast } from '@/hooks/use-toast';

// Load environment variables

// const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

console.log("Loaded API Key:", GEMINI_API_KEY); 
const REACT_APP_GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;


// Get the API key from localStorage (fallback)
const getApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem('gemini-api-key') || '';
};

export const getGeminiResponse = async (
  userMessage: string, 
  attachments: Attachment[] = [],
  previousMessages: GeminiMessage[] = []
): Promise<string> => {
  try {
    const apiKey = getApiKey();
    
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please set your Gemini API key in the settings",
        variant: "destructive"
      });
      return "Please set your Gemini API key using the 'Set API Key' button.";
    }
    
    // Build conversation history
    const messages: GeminiMessage[] = [
      ...previousMessages,
      {
        role: 'user',
        parts: [{ text: userMessage }]
      }
    ];

    // Add PDF attachments if present
    if (attachments.length > 0) {
      for (const attachment of attachments) {
        if (attachment.type === 'application/pdf' && attachment.fileData) {
          const base64Data = attachment.fileData.split(',')[1]; // Extract base64
          messages[messages.length - 1].parts.push({
            inlineData: { mimeType: 'application/pdf', data: base64Data }
          });
        }
      }
    }

    // Add system message for context if it's the first request
    if (previousMessages.length === 0) {
      messages.unshift({
        role: 'user',
        parts: [{ 
          text: "You are LegalGist Assistant, an AI that helps users understand legal documents. When PDFs are provided, analyze them and provide insights. Be helpful, concise, and accurate. Your name is LegalGist Assistant."
        }]
      });
    }

    const requestBody: GeminiRequest = {
      contents: messages,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(REACT_APP_GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      throw new Error(`API error: ${response.status} ${errorData?.error?.message || 'Unknown error'}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (!data.candidates?.length || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return "I'm sorry, I encountered an error processing your request. Please try again.";
  }
};

// Helper function to convert chat messages to Gemini format
export const convertChatToGeminiMessages = (messages: Array<{role: string, content: string}>): GeminiMessage[] => {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
};
