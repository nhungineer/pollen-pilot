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
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6 mb-4">
          {/* Circular Risk Level Gauge */}
          <div className="flex-shrink-0 mb-4 lg:mb-0">
            <div className="text-center mb-3">
              <p className="text-sm text-gray-700 font-semibold tracking-wide">Hay fever risk</p>
            </div>
            <div className="relative mx-auto lg:mx-0" style={{ width: '116px', height: '116px' }}>
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
          <div className="flex-1 grid grid-cols-2 gap-4 lg:gap-3">
            {/* Pollen Count */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.5 8.5L20 7L14.5 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9.5 12L4 7L10.5 8.5L12 2Z" fill="#D97706" stroke="#D97706" strokeWidth="1"/>
                  <circle cx="12" cy="12" r="2" fill="#F59E0B"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.grassPollen}</div>
                <div className="text-xs text-gray-500 font-light">grains/m³</div>
              </div>
            </div>

            {/* Wind */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 8H13C15.2091 8 17 9.79086 17 12C17 14.2091 15.2091 16 13 16H12" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M18 15H19C20.1046 15 21 14.1046 21 13C21 11.8954 20.1046 11 19 11H3" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 5H10C11.1046 5 12 5.89543 12 7C12 8.10457 11.1046 9 10 9H9" stroke="#0EA5E9" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.windSpeed}</div>
                <div className="text-xs text-gray-500 font-light">km/h</div>
              </div>
            </div>

            {/* Temperature */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3V21M12 3C10.8954 3 10 3.89543 10 5V15.1707C8.83481 16.0464 8 17.4362 8 19C8 21.2091 9.79086 23 12 23C14.2091 23 16 21.2091 16 19C16 17.4362 15.1652 16.0464 14 15.1707V5C14 3.89543 13.1046 3 12 3Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="19" r="2" fill="#F59E0B"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.temperature}°C</div>
                <div className="text-xs text-gray-500 font-light">Feels like 27°</div>
              </div>
            </div>

            {/* Humidity */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3L16 8H8L12 3Z" fill="#3B82F6"/>
                  <ellipse cx="12" cy="15" rx="6" ry="6" fill="#3B82F6"/>
                  <path d="M12 3C7.58172 3 4 6.58172 4 11C4 15.4183 7.58172 19 12 19C16.4183 19 20 15.4183 20 11C20 9.11438 19.2622 7.40356 18.0503 6.09018" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{scenario.humidity}%</div>
                <div className="text-xs text-gray-500 font-light">humidity</div>
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