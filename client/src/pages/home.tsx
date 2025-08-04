import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SimpleConditions } from "@/components/simple-conditions";
import { SimpleChatInterface } from "@/components/simple-chat-interface";
import { Card } from "@/components/ui/card";
import { scenarios, type PollenScenario } from "@/data/scenarios";
import { createChatSession, type ChatMessage } from "@/services/claude-api";

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<PollenScenario>(scenarios[0]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: () => createChatSession(selectedScenario.name, 'General'),
    onSuccess: (session) => {
      setSessionId(session.id);
      setMessages([]);
    },
    onError: (error) => {
      toast({
        title: "Failed to create chat session",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create new session when scenario changes
  useEffect(() => {
    createSessionMutation.mutate();
  }, [selectedScenario.name]);

  const handleScenarioChange = (scenarioName: string) => {
    const scenario = scenarios.find(s => s.name === scenarioName);
    if (scenario) {
      setSelectedScenario(scenario);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    if (question && sessionId) {
      const userMessage: ChatMessage = {
        role: 'user',
        content: question,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <i className="fas fa-seedling text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">Pollen Pilot</h1>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-map-marker-alt text-gray-500 text-sm"></i>
              <span className="text-sm text-gray-600">Melbourne, Australia</span>
              <i className="fas fa-bell text-gray-500 text-lg"></i>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Simple Conditions Display */}
        <SimpleConditions
          scenario={selectedScenario}
          onScenarioChange={handleScenarioChange}
        />

        {/* Simple Chat Interface */}
        <SimpleChatInterface
          sessionId={sessionId}
          scenario={selectedScenario}
          messages={messages}
          onMessagesUpdate={setMessages}
          onSuggestedQuestion={handleSuggestedQuestion}
        />
      </div>
    </div>
  );
}
