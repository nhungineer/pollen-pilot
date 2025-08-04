import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage, rateResponse, type ChatMessage } from "@/services/claude-api";
import { type PollenScenario } from "@/data/scenarios";

interface ChatInterfaceProps {
  sessionId: string | null;
  scenario: PollenScenario;
  flow: string;
  messages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
}

export function ChatInterface({ 
  sessionId, 
  scenario, 
  flow, 
  messages, 
  onMessagesUpdate 
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [ratings, setRatings] = useState<Map<number, 'positive' | 'negative'>>(new Map());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!sessionId) throw new Error('No active chat session');
      return sendMessage(sessionId, message, scenario, flow);
    },
    onSuccess: (data) => {
      onMessagesUpdate([...messages, data.message]);
      setInputMessage('');
    },
    onError: (error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rateResponseMutation = useMutation({
    mutationFn: async ({ messageIndex, rating }: { messageIndex: number; rating: 'positive' | 'negative' }) => {
      if (!sessionId) throw new Error('No active chat session');
      return rateResponse(sessionId, messageIndex, rating);
    },
    onSuccess: (_, variables) => {
      setRatings(prev => new Map(prev.set(variables.messageIndex, variables.rating)));
      toast({
        title: "Rating recorded",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error rating response",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    const message = inputMessage.trim();
    if (!message || !sessionId) return;

    // Add user message immediately for better UX
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };
    onMessagesUpdate([...messages, userMessage]);
    setInputMessage('');

    sendMessageMutation.mutate(message);
  };

  const handleRating = (messageIndex: number, rating: 'positive' | 'negative') => {
    rateResponseMutation.mutate({ messageIndex, rating });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!sessionId) {
    return (
      <div className="px-4 pb-4">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Starting chat session...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 pb-4">
      <Card className="border border-gray-200 shadow-sm">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-900">Ask PollenPilot</h3>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">AI Assistant</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <i className="fas fa-comments text-2xl mb-2"></i>
              <p className="text-sm">Start a conversation with PollenPilot</p>
              <p className="text-xs mt-1">Ask about timing, activities, or symptoms</p>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'space-x-3'}`}>
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-xs"></i>
                </div>
              )}
              
              <div className={`flex-1 ${message.role === 'user' ? 'max-w-xs' : ''}`}>
                <div className={`rounded-lg p-3 ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white ml-auto' 
                    : 'bg-gray-50'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-3 mt-2">
                    <span className="text-xs text-gray-500">
                      {message.confidence && `${message.confidence} confidence`}
                      {message.scenario && ` • ${message.scenario}`}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-1 h-6 w-6 ${ratings.get(index) === 'positive' ? 'text-blue-500' : 'text-gray-400'}`}
                        onClick={() => handleRating(index, 'positive')}
                        disabled={rateResponseMutation.isPending}
                      >
                        <i className="fas fa-thumbs-up text-xs"></i>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-1 h-6 w-6 ${ratings.get(index) === 'negative' ? 'text-red-500' : 'text-gray-400'}`}
                        onClick={() => handleRating(index, 'negative')}
                        disabled={rateResponseMutation.isPending}
                      >
                        <i className="fas fa-thumbs-down text-xs"></i>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {sendMessageMutation.isPending && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-white text-xs"></i>
              </div>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Ask about timing, activities, or symptoms..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 text-sm"
              disabled={sendMessageMutation.isPending}
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              <i className="fas fa-paper-plane text-sm"></i>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
