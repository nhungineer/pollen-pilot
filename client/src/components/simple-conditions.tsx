import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { scenarios, type PollenScenario, getRiskLevelColor } from "@/data/scenarios";

interface SimpleConditionsProps {
  scenario: PollenScenario;
  onScenarioChange: (scenarioName: string) => void;
}


export function SimpleConditions({ scenario, onScenarioChange }: SimpleConditionsProps) {
  const riskColor = getRiskLevelColor(scenario.riskLevel);
  
  // Get risk level for gauge display
  const getRiskLevel = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 1;
      case 'moderate': return 2;
      case 'high': return 3;
      case 'very high': return 4;
      case 'extreme': return 5;
      default: return 2;
    }
  };

  const riskNumeric = getRiskLevel(scenario.riskLevel);

  return (
    <div className="p-4">
      {/* Scenario Selector */}
      <div className="mb-4">
        <Select value={scenario.name} onValueChange={onScenarioChange}>
          <SelectTrigger className="w-full bg-gray-100 border-0 focus:ring-2 focus:ring-blue-500">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((s) => (
              <SelectItem key={s.name} value={s.name}>
                Scenario {scenarios.indexOf(s) + 1}: {s.riskLevel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Conditions Card */}
      <Card className="p-4 pb-2">
        {/* Layout with Circular Risk Gauge and Weather Data */}
        <div className="flex items-start space-x-6 mb-2">
          {/* Circular Risk Level Gauge */}
          <div className="flex-shrink-0">
            <div className="text-center mb-2">
              <p className="text-xs text-gray-600 font-medium">Hay fever risk</p>
            </div>
            <div className="relative w-29 h-29" style={{ width: '116px', height: '116px' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  stroke="#e5e7eb" 
                  strokeWidth="8" 
                  fill="none"
                />
                {/* Progress circle with gradient colors based on risk */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  stroke={riskColor}
                  strokeWidth="8" 
                  fill="none"
                  strokeDasharray={`${(riskNumeric / 5) * 220} 220`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              {/* Risk level text in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {scenario.riskLevel.split(' ').map((word, index) => (
                    <div key={index} className="text-[10px] font-bold text-gray-900 uppercase leading-tight">
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

            {/* Weather Data Grid */}
            <div className="flex-1 grid grid-cols-2 gap-3">
            {/* Pollen Count */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-seedling text-orange-600 text-sm"></i>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{scenario.grassPollen}</div>
                <div className="text-xs text-gray-600">grains/m3</div>
              </div>
            </div>

            {/* Wind */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-wind text-blue-600 text-sm"></i>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{scenario.windSpeed}</div>
                <div className="text-xs text-gray-600">km/h</div>
              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-thermometer-half text-yellow-600 text-sm"></i>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{scenario.temperature}°C</div>
                <div className="text-xs text-gray-600">Feels like 27°</div>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-tint text-blue-600 text-sm"></i>
              </div>
              <div>
                <div className="text-lg font-semibold text-gray-900">{scenario.humidity}%</div>
                <div className="text-xs text-gray-600">humidity</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Caption */}
        <div className="mt-0 pt-1 border-t border-gray-100">
          <p className="text-xs text-gray-400">
            Source: BOM, Melbourne Pollen, last updated {new Date().toLocaleTimeString('en-AU', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Australia/Melbourne'
            })}
          </p>
        </div>

      </Card>
    </div>
  );
}