import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CurrentConditions } from "@/components/current-conditions";
import { FlowSelector } from "@/components/flow-selector";
import { ProactiveRecommendations } from "@/components/proactive-recommendations";
import { ChatInterface } from "@/components/chat-interface";
import { QuickActions } from "@/components/quick-actions";
import { Card } from "@/components/ui/card";
import { scenarios, type PollenScenario } from "@/data/scenarios";
import { createChatSession, type ChatMessage } from "@/services/claude-api";

export default function Home() {
  const [selectedScenario, setSelectedScenario] = useState<PollenScenario>(scenarios[0]);
  const [selectedFlow, setSelectedFlow] = useState('Morning Check-in');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: () => createChatSession(selectedScenario.name, selectedFlow),
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

  // Create new session when scenario or flow changes
  useEffect(() => {
    createSessionMutation.mutate();
  }, [selectedScenario.name, selectedFlow]);

  const handleScenarioChange = (scenarioName: string) => {
    const scenario = scenarios.find(s => s.name === scenarioName);
    if (scenario) {
      setSelectedScenario(scenario);
    }
  };

  const handleQuickAction = (action: string) => {
    const actionMessages: Record<string, string> = {
      timing: "What are the best times for outdoor activities today?",
      forecast: "What will tomorrow's pollen conditions be like?",
      symptoms: "I'm experiencing itchy eyes and runny nose. What should I do?",
    };

    const message = actionMessages[action];
    if (message && sessionId) {
      // Add the message to current messages to trigger send
      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
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
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-seedling text-white text-sm"></i>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">PollenPilot</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Melbourne</span>
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Main App Container */}
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Current Conditions Hero Section */}
        <CurrentConditions
          scenario={selectedScenario}
          onScenarioChange={handleScenarioChange}
        />

        {/* Flow Selection */}
        <FlowSelector
          selectedFlow={selectedFlow}
          onFlowChange={setSelectedFlow}
        />

        {/* Proactive Recommendations */}
        <ProactiveRecommendations scenario={selectedScenario} />

        {/* Chat Interface */}
        <ChatInterface
          sessionId={sessionId}
          scenario={selectedScenario}
          flow={selectedFlow}
          messages={messages}
          onMessagesUpdate={setMessages}
        />

        {/* Quick Actions */}
        <QuickActions
          sessionId={sessionId}
          onActionClick={handleQuickAction}
        />

        {/* Proactive Alert Simulation */}
        <div className="px-4 pb-6">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-bell text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">Proactive Alert Simulation</h4>
                <p className="text-sm text-gray-700 mb-3">How you'd receive real-time notifications:</p>
                <div className="space-y-2">
                  <div className="text-xs bg-white/70 p-2 rounded border-l-2 border-amber-400">
                    <strong>8:00 AM:</strong> Good morning! High pollen alert today. Take antihistamine now.
                  </div>
                  <div className="text-xs bg-white/70 p-2 rounded border-l-2 border-blue-400">
                    <strong>2:00 PM:</strong> Midday check-in: How are your symptoms? Wind changing to southerly.
                  </div>
                  <div className="text-xs bg-white/70 p-2 rounded border-l-2 border-green-400">
                    <strong>4:00 PM:</strong> Relief coming! Southerly change bringing cleaner air.
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Melbourne Data Context */}
        <div className="px-4 pb-6">
          <Card className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">Melbourne Pollen Intelligence</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1530587191325-3db32d826c18?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                  alt="Microscopic pollen particles" 
                  className="w-full h-20 object-cover rounded-lg mb-2" 
                />
                <span className="text-xs font-medium text-gray-900">20+ Years Data</span>
                <p className="text-xs text-gray-600">Historical patterns</p>
              </div>
              <div className="text-center">
                <img 
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=200" 
                  alt="Person outdoors with hayfever symptoms" 
                  className="w-full h-20 object-cover rounded-lg mb-2" 
                />
                <span className="text-xs font-medium text-gray-900">Real-time AI</span>
                <p className="text-xs text-gray-600">Personalized advice</p>
              </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>Season: Sept - Dec</span>
                <span>Peak: Late Nov</span>
                <span>Main trigger: Rye grass</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-gray-200 px-4 py-3 sticky bottom-0">
          <div className="flex justify-center space-x-8">
            <button className="flex flex-col items-center space-y-1 text-blue-500">
              <i className="fas fa-home text-lg"></i>
              <span className="text-xs">Home</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400">
              <i className="fas fa-chart-line text-lg"></i>
              <span className="text-xs">Trends</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400">
              <i className="fas fa-user-circle text-lg"></i>
              <span className="text-xs">Profile</span>
            </button>
            <button className="flex flex-col items-center space-y-1 text-gray-400">
              <i className="fas fa-cog text-lg"></i>
              <span className="text-xs">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
