import { Card } from "@/components/ui/card";
import { type PollenScenario, getRiskLevelColor } from "@/data/scenarios";

interface ProactiveRecommendationsProps {
  scenario: PollenScenario;
}

export function ProactiveRecommendations({ scenario }: ProactiveRecommendationsProps) {
  const riskColor = getRiskLevelColor(scenario.riskLevel);
  const isHighRisk = ['high', 'very high', 'extreme'].includes(scenario.riskLevel.toLowerCase());

  const getRecommendations = () => {
    if (isHighRisk) {
      return [
        { icon: 'fas fa-pills', text: 'Take antihistamine now (before symptoms start)' },
        { icon: 'fas fa-spray-can', text: 'Use nasal spray - preventative dose' },
        { icon: 'fas fa-home', text: 'Avoid outdoor activities 5am-10am (peak release)' }
      ];
    } else {
      return [
        { icon: 'fas fa-walking', text: 'Good conditions for outdoor activities' },
        { icon: 'fas fa-window-open', text: 'Safe to open windows for fresh air' },
        { icon: 'fas fa-leaf', text: 'Monitor for any wind changes' }
      ];
    }
  };

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 mb-3">Proactive Recommendations</h3>
      
      {/* Immediate Actions Card */}
      <Card className={`p-4 ${isHighRisk ? 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200' : 'bg-gradient-to-r from-green-50 to-blue-50 border-green-200'}`}>
        <div className="flex items-start space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: riskColor }}
          >
            <i className={`fas ${isHighRisk ? 'fa-shield-alt' : 'fa-check'} text-white text-sm`}></i>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">
              {isHighRisk ? 'Immediate Protection' : 'Good Conditions'}
            </h4>
            <ul className="space-y-1 text-sm text-gray-700">
              {getRecommendations().map((rec, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <i className={`${rec.icon} text-xs`} style={{ color: riskColor }}></i>
                  <span>{rec.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      {/* Melbourne Context Card */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-map-marker-alt text-white text-sm"></i>
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2">Melbourne Conditions</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center space-x-2">
                <i className="fas fa-wind text-blue-500 text-xs"></i>
                <span className="text-gray-700">{scenario.windSpeed}km/h {scenario.windDirection}</span>
              </div>
              <div className="flex items-center space-x-2">
                <i className="fas fa-thermometer-half text-blue-500 text-xs"></i>
                <span className="text-gray-700">{scenario.temperature}°C ({scenario.humidity}% humidity)</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {scenario.windDirection.toLowerCase() === 'north' || scenario.windDirection.toLowerCase() === 'northerly' 
                ? 'Northerly winds bringing grass pollen from countryside areas. Expect conditions to persist until evening southerly change.'
                : scenario.windDirection.toLowerCase() === 'south' || scenario.windDirection.toLowerCase() === 'southerly'
                ? 'Southerly winds bringing clean ocean air. Good conditions for sensitive individuals.'
                : 'Variable wind conditions. Monitor for changes throughout the day.'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
