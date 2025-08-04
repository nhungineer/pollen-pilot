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
        
        {/* Risk Level Gauge */}
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-32 h-16">
            {/* Semi-circle gauge background */}
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 50" className="w-full h-full">
                {/* Background arc */}
                <path
                  d="M 10 40 A 30 30 0 0 1 90 40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Active arc */}
                <path
                  d="M 10 40 A 30 30 0 0 1 90 40"
                  stroke={riskColor}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(riskNumeric / 5) * 125} 125`}
                  className="transition-all duration-500"
                />
                {/* Needle */}
                <line
                  x1="50"
                  y1="40"
                  x2={50 + 25 * Math.cos((Math.PI * (riskNumeric - 1)) / 4 - Math.PI)}
                  y2={40 + 25 * Math.sin((Math.PI * (riskNumeric - 1)) / 4 - Math.PI)}
                  stroke="#374151"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="50" cy="40" r="3" fill="#374151" />
              </svg>
            </div>
            {/* Risk label */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
              <span 
                className="text-sm font-medium px-2 py-1 rounded-full"
                style={{ 
                  backgroundColor: `${riskColor}1a`,
                  color: riskColor
                }}
              >
                {scenario.riskLevel} risk
              </span>
            </div>
          </div>
        </div>

        {/* Weather Data Grid */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Pollen Count */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <i className="fas fa-seedling text-orange-600"></i>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">{scenario.grassPollen}</div>
            <div className="text-xs text-gray-600">grain/m3</div>
          </div>

          {/* Temperature */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <i className="fas fa-thermometer-half text-yellow-600"></i>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">{scenario.temperature}°C</div>
            <div className="text-xs text-gray-600">Feels like 27°</div>
          </div>

          {/* Wind */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <i className="fas fa-wind text-blue-600"></i>
              </div>
            </div>
            <div className="text-lg font-semibold text-gray-900">{scenario.windSpeed}km/h</div>
            <div className="text-xs text-gray-600">{scenario.windDirection} East</div>
          </div>
        </div>

        {/* Conditions Description */}
        <p className="text-sm text-gray-600 mb-3">
          {scenario.conditions}. Conditions to persist until evening southerly change.
        </p>

        {/* Basic Recommendations */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
          <div className="flex items-start space-x-2">
            <span className="font-medium text-blue-600">7:00AM</span>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                Good morning! Today's looking moderately challenging - grass pollen (38 grains/m³) and northeasterly winds 🌬️
                <br />
                <span className="inline-flex items-center space-x-1 mt-1">
                  <i className="fas fa-pills text-yellow-500 text-xs"></i>
                  <span className="text-xs">Don't forget to take your antihistamine and try to stay indoor till after 10AM.</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}