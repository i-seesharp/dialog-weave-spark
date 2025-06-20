
import { useState } from "react";
import { Sidebar } from "@/components/ChatSidebar";
import { ChatInterface } from "@/components/ChatInterface";
import { SidebarProvider } from "@/components/ui/sidebar";

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  executionId?: string;
  isLoading?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

const Index = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
    return newConversation.id;
  };

  const updateConversation = (conversationId: string, updates: Partial<Conversation>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, ...updates, updatedAt: new Date() }
          : conv
      )
    );
  };

  const addMessage = (conversationId: string, message: Message) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, message],
              title: conv.messages.length === 0 ? message.content.slice(0, 50) + "..." : conv.title,
              updatedAt: new Date()
            }
          : conv
      )
    );
  };

  const updateMessage = (conversationId: string, messageId: string, updates: Partial<Message>) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              messages: conv.messages.map(msg => 
                msg.id === messageId ? { ...msg, ...updates } : msg
              ),
              updatedAt: new Date()
            }
          : conv
      )
    );
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversationId === conversationId) {
      setActiveConversationId(null);
    }
  };

  const activeConversation = conversations.find(conv => conv.id === activeConversationId);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={createNewConversation}
          onDeleteConversation={deleteConversation}
        />
        
        <main className="flex-1">
          <ChatInterface
            conversation={activeConversation}
            onSendMessage={(content) => {
              let conversationId = activeConversationId;
              
              if (!conversationId) {
                conversationId = createNewConversation();
              }
              
              const userMessage: Message = {
                id: Date.now().toString(),
                content,
                role: "user",
                timestamp: new Date(),
              };
              
              addMessage(conversationId, userMessage);
              
              // Create loading assistant message
              const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "",
                role: "assistant",
                timestamp: new Date(),
                isLoading: true,
              };
              
              addMessage(conversationId, assistantMessage);
              
              // Simulate API calls
              handleAPICall(conversationId, assistantMessage.id, content);
            }}
          />
        </main>
      </div>
    </SidebarProvider>
  );

  async function handleAPICall(conversationId: string, messageId: string, userInput: string) {
    try {
      // Simulate first API call to get executionId
      const executionId = await simulateInitialAPICall(userInput);
      
      updateMessage(conversationId, messageId, { executionId });
      
      // Start polling for result
      const result = await pollForResult(executionId);
      
      // Update message with final result
      updateMessage(conversationId, messageId, {
        content: result,
        isLoading: false,
      });
      
    } catch (error) {
      updateMessage(conversationId, messageId, {
        content: "Sorry, I encountered an error processing your request.",
        isLoading: false,
      });
    }
  }

  async function simulateInitialAPICall(userInput: string): Promise<string> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock executionId
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async function pollForResult(executionId: string): Promise<string> {
    // Simulate polling with random delay
    const delay = Math.random() * 3000 + 1000; // 1-4 seconds
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Return mock response based on executionId
    const responses = [
      "I understand your question. Based on the information provided, here's my response...",
      "That's an interesting point. Let me think about this and provide you with a comprehensive answer.",
      "I can help you with that. Here's what I would recommend based on best practices...",
      "Thank you for your question. After processing your request, here's my detailed response.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
};

export default Index;
