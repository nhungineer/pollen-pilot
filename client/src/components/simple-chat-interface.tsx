import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { sendMessage, type ChatMessage } from "@/services/claude-api";
import { type PollenScenario } from "@/data/scenarios";

interface SimpleChatInterfaceProps {
  sessionId: string | null;
  scenario: PollenScenario;
  messages: ChatMessage[];
  onMessagesUpdate: (messages: ChatMessage[]) => void;
  onSuggestedQuestion: (question: string) => void;
}

const suggestedQuestions = [
  "Should I leave the window open?",
  "Can I go for a run this evening?", 
  "Is picnic a good idea this weekend?"
];

export function SimpleChatInterface({ 
  sessionId, 
  scenario, 
  messages, 
  onMessagesUpdate,
  onSuggestedQuestion
}: SimpleChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!sessionId) throw new Error('No active chat session');
      return sendMessage(sessionId, message, scenario, 'General');
    },
    onSuccess: (data) => {
      onMessagesUpdate([...messages, data.message]);
      setInputMessage('');
    },
    onError: (error: any) => {
      toast({
        title: "Error sending message",
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

  const handleSuggestedClick = (question: string) => {
    onSuggestedQuestion(question);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!sessionId) {
    return (
      <div className="p-4">
        <Card className="p-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">Connecting to PollenPilot...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Ask PollenPilot Section */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask PollenPilot</h3>
        <p className="text-sm text-gray-600 mb-4">Get personalised recommendations based on your plan</p>

        {/* Suggested Questions */}
        {messages.length === 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-3">Try asking</p>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  onClick={() => handleSuggestedClick(question)}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-comment text-blue-600 text-xs"></i>
                    </div>
                    <span className="text-sm">{question}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        {messages.length > 0 && (
          <Card className="border border-gray-200 mb-4">
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'space-x-3'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fas fa-seedling text-white text-xs"></i>
                    </div>
                  )}
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'max-w-xs' : ''}`}>
                    <div className={`rounded-lg p-3 ${
                      message.role === 'user' 
                        ? 'bg-blue-500 text-white ml-auto' 
                        : 'bg-gray-50'
                    }`}>
                      {message.role === 'assistant' ? (
                        <div className="text-sm" dangerouslySetInnerHTML={{ 
                          __html: message.content
                            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                            .replace(/\*(.*?)\*/g, '<em>$1</em>')
                            .replace(/- (.*?)$/gm, '• $1')
                            .replace(/\n/g, '<br>')
                        }} />
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs text-gray-500">
                          {message.confidence && `${message.confidence} confidence`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {sendMessageMutation.isPending && (
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fas fa-seedling text-white text-xs"></i>
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
          </Card>
        )}

        {/* Chat Input */}
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Ask about your hayfever management"
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
    </div>
  );
}