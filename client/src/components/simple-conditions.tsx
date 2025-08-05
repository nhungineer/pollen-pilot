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
      <div className="mb-6">
        <Select value={scenario.name} onValueChange={onScenarioChange}>
          <SelectTrigger className="w-full bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
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
      <Card className="p-6 pb-4 border-0 shadow-lg rounded-2xl bg-gradient-to-br from-white to-gray-50/30">
        {/* Layout with Circular Risk Gauge and Weather Data */}
        <div className="flex items-start space-x-6 mb-2">
          {/* Circular Risk Level Gauge */}
          <div className="flex-shrink-0">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-700 font-semibold tracking-wide">Hay fever risk</p>
            </div>
            <div className="relative w-29 h-29" style={{ width: '116px', height: '116px' }}>
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  stroke="#f3f4f6" 
                  strokeWidth="6" 
                  fill="none"
                />
                {/* Progress circle with gradient colors based on risk */}
                <circle 
                  cx="50" 
                  cy="50" 
                  r="35" 
                  stroke={riskColor}
                  strokeWidth="6" 
                  fill="none"
                  strokeDasharray={`${(riskNumeric / 5) * 220} 220`}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                />
              </svg>
              {/* Risk level text in center */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  {scenario.riskLevel.split(' ').map((word, index) => (
                    <div key={index} className="text-xs font-bold text-gray-800 uppercase leading-tight tracking-wide">
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-lg">🌾</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.grassPollen}</div>
                <div className="text-sm text-gray-500 font-medium">grains/m³</div>
              </div>
            </div>

            {/* Wind */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-lg">💨</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.windSpeed}</div>
                <div className="text-sm text-gray-500 font-medium">km/h</div>
              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-lg">🌡️</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.temperature}°C</div>
                <div className="text-sm text-gray-500 font-medium">Feels like 27°</div>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-lg">💧</span>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.humidity}%</div>
                <div className="text-sm text-gray-500 font-medium">humidity</div>
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