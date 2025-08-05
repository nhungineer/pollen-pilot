import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { sendMessage, type ChatMessage } from "@/services/claude-api";
import { type PollenScenario } from "@/data/scenarios";

// Helper function for scenario-specific recommendations with emojis
const getScenarioRecommendation = (scenario: PollenScenario) => {
  switch (scenario.name) {
    case "Classic Bad Day - Melbourne Cup Day":
      return `👋 Morning, today's looking challenging 😰 - high grass pollen 🌾 (${scenario.grassPollen} grains/m³) and gusty northerly 💨. Don't forget to take antihistamine 💊, and stay indoor 🏡 till after 3PM.`;
    case "Deceptive Calm":
      return `👋 Morning! Today's moderate challenge 😐 - grass pollen 🌾 (${scenario.grassPollen} grains/m³) with light winds 💨. Take your antihistamine 💊 and limit outdoor time 🏡 till afternoon.`;
    case "Thunderstorm Asthma Risk":
      return `⚠️ Morning alert! Very challenging day 😰 - high grass pollen 🌾 (${scenario.grassPollen} grains/m³) with storm risk ⛈️. Take antihistamine 💊 now and stay indoors 🏡 when storms hit.`;
    case "Southerly Relief":
      return `👋 Great morning! 😊 Low pollen day 🌾 (${scenario.grassPollen} grains/m³) with clean southerly winds 💨. Perfect for outdoor activities 🚶‍♂️ and opening windows 🪟.`;
    default:
      return `👋 Morning! Today's moderate challenge 😐 - grass pollen 🌾 (${scenario.grassPollen} grains/m³) with light winds 💨. Take your antihistamine 💊 and limit outdoor time 🏡.`;
  }
};

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
  const [usedQuestions, setUsedQuestions] = useState<string[]>([]);
  const [currentScenario, setCurrentScenario] = useState(scenario);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Reset used questions when scenario changes
  useEffect(() => {
    if (currentScenario !== scenario) {
      setUsedQuestions([]);
      setCurrentScenario(scenario);
    }
  }, [scenario, currentScenario]);

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
    setInputMessage(question);
    setUsedQuestions(prev => [...prev, question]);
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
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Ask PollenPilot</h3>
        <p className="text-base text-gray-600 mb-6">Chat with me for more specific recommendations</p>



        {/* Initial AI Message */}
        <Card className="border-0 shadow-lg rounded-2xl mb-6 bg-gradient-to-br from-white to-gray-50/30">
          <div className="p-6 space-y-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <i className="fas fa-seedling text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 shadow-sm">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {getScenarioRecommendation(scenario)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Chat Messages */}
        {messages.length > 0 && (
          <Card className="border-0 shadow-lg rounded-2xl mb-6 bg-gradient-to-br from-white to-gray-50/30">
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'space-x-3'}`}>
                  {message.role === 'assistant' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      <i className="fas fa-seedling text-white text-sm"></i>
                    </div>
                  )}
                  
                  <div className={`flex-1 ${message.role === 'user' ? 'max-w-xs' : ''}`}>
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'user' 
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white ml-auto shadow-lg' 
                        : 'bg-gradient-to-br from-gray-50 to-gray-100/50 shadow-sm'
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
                <div className="flex space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <i className="fas fa-seedling text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-4 shadow-sm">
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
        <div className="flex space-x-3 mb-6">
          <Input
            type="text"
            placeholder="e.g. Should I walk the dog at 3?"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 text-base border-0 bg-white rounded-2xl shadow-sm px-5 py-4 focus:ring-2 focus:ring-indigo-500 focus:shadow-lg transition-all duration-200"
            disabled={sendMessageMutation.isPending}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || sendMessageMutation.isPending}
            className="px-6 py-4 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 rounded-2xl shadow-lg hover:shadow-xl border-0"
          >
            <i className="fas fa-paper-plane text-base"></i>
          </Button>
        </div>

        {/* Suggested Questions - Now below input */}
        {messages.length === 0 && (
          <div>
            <p className="text-sm text-gray-500 mb-3">Try asking</p>
            <div className="space-y-2">
              {suggestedQuestions
                .filter(question => !usedQuestions.includes(question))
                .map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-4 px-5 bg-gradient-to-br from-indigo-50 to-blue-50 border-0 text-indigo-700 hover:from-indigo-100 hover:to-blue-100 transition-all duration-200 rounded-2xl shadow-sm hover:shadow-md"
                  onClick={() => handleSuggestedClick(question)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <i className="fas fa-comment text-indigo-600 text-sm"></i>
                    </div>
                    <span className="text-base font-medium">{question}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}