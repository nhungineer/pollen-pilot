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
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current conditions</h2>
        
        {/* Layout with Risk Gauge and Weather Data */}
        <div className="flex items-start space-x-6 mb-4">
          {/* Risk Level Gauge */}
          <div className="flex-shrink-0">
            <div className="relative w-20 h-12">
              <svg viewBox="0 0 100 60" className="w-full h-full">
                {/* Background arc segments */}
                <path d="M 15 45 A 25 25 0 0 1 45 20" stroke="#22c55e" strokeWidth="8" fill="none" />
                <path d="M 45 20 A 25 25 0 0 1 55 20" stroke="#eab308" strokeWidth="8" fill="none" />
                <path d="M 55 20 A 25 25 0 0 1 85 45" stroke="#ef4444" strokeWidth="8" fill="none" />
                
                {/* Needle */}
                <line
                  x1="50"
                  y1="45"
                  x2={50 + 20 * Math.cos(Math.PI - (Math.PI * (riskNumeric - 1)) / 4)}
                  y2={45 - 20 * Math.sin(Math.PI - (Math.PI * (riskNumeric - 1)) / 4)}
                  stroke="#374151"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="45" r="2" fill="#374151" />
              </svg>
            </div>
            <div className="text-center mt-1">
              <span className="text-sm font-medium text-gray-900">{scenario.riskLevel} risk</span>
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

        {/* Conditions Description */}
        <p className="text-sm text-gray-700 mb-4 text-left">
          {scenario.conditions}. Conditions to persist until evening southerly change.
        </p>

        {/* Basic Recommendations */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-3 text-left">Recommendations</h3>
          <div className="space-y-3">
            <div className="text-left">
              <div className="flex items-start space-x-3">
                <span className="font-semibold text-blue-600 flex-shrink-0">7:00AM</span>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Good morning! Today's looking moderately challenging - grass pollen ({scenario.grassPollen} grains/m³) and northeasterly winds 🌬️
                  </p>
                  <div className="flex items-start space-x-2 mt-2">
                    <i className="fas fa-pills text-yellow-500 text-sm mt-0.5 flex-shrink-0"></i>
                    <p className="text-sm text-gray-700">
                      Don't forget to take your antihistamine and try to stay indoor till after 10AM.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}