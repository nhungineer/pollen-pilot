import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { scenarios, type PollenScenario, getRiskLevelColor } from "@/data/scenarios";

interface CurrentConditionsProps {
  scenario: PollenScenario;
  onScenarioChange: (scenarioName: string) => void;
}

export function CurrentConditions({ scenario, onScenarioChange }: CurrentConditionsProps) {
  const riskColor = getRiskLevelColor(scenario.riskLevel);
  
  const getIconForRisk = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return 'fas fa-check-circle';
      case 'moderate':
        return 'fas fa-exclamation-circle';
      case 'high':
      case 'very high':
        return 'fas fa-exclamation-triangle';
      case 'extreme':
        return 'fas fa-skull-crossbones';
      default:
        return 'fas fa-question-circle';
    }
  };

  return (
    <div className="relative overflow-hidden">
      {/* Melbourne cityscape background */}
      <div className="h-48 bg-gradient-to-br from-blue-600 to-blue-800 relative">
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <img 
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
          alt="Melbourne skyline" 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      
      {/* Risk Level Overlay */}
      <div className="absolute bottom-4 left-4 right-4">
        <Card className="bg-white/95 backdrop-blur-sm p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-gray-900">Current Risk</h2>
            <Select value={scenario.name} onValueChange={onScenarioChange}>
              <SelectTrigger className="bg-gray-100 text-xs px-2 py-1 w-auto border-0 focus:ring-2 focus:ring-blue-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {scenarios.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span 
                  className="text-2xl font-bold"
                  style={{ color: riskColor }}
                >
                  {scenario.riskLevel}
                </span>
                <div 
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{ 
                    backgroundColor: `${riskColor}1a`,
                    color: riskColor
                  }}
                >
                  {scenario.grassPollen} grains/m³
                </div>
              </div>
              <p className="text-sm text-gray-600">{scenario.conditions}</p>
            </div>
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ 
                background: `linear-gradient(to bottom right, ${riskColor}, ${riskColor}dd)`
              }}
            >
              <i className={`${getIconForRisk(scenario.riskLevel)} text-white`}></i>
            </div>
          </div>
          
          {/* Confidence Indicator */}
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex space-x-1">
              {[1, 2, 3, 4].map((dot) => (
                <div
                  key={dot}
                  className={`w-2 h-2 rounded-full ${
                    dot <= 3 ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600">{scenario.confidence}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
