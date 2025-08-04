export interface PollenScenario {
  name: string;
  date: string;
  grassPollen: number;
  windSpeed: number;
  windDirection: string;
  temperature: number;
  humidity: number;
  riskLevel: string;
  conditions: string;
  confidence: string;
}

export const scenarios: PollenScenario[] = [
  {
    name: "Classic Bad Day - Melbourne Cup Day",
    date: "November 6, 2024",
    grassPollen: 85,
    windSpeed: 24,
    windDirection: "North",
    temperature: 29,
    humidity: 42,
    riskLevel: "Very High",
    conditions: "Hot northerly winds bringing pollen from countryside",
    confidence: "High - matches historical Cup Day patterns"
  },
  {
    name: "Deceptive Calm",
    date: "October 15, 2024", 
    grassPollen: 45,
    windSpeed: 6,
    windDirection: "Variable",
    temperature: 22,
    humidity: 68,
    riskLevel: "Moderate",
    conditions: "Still air, moderate pollen - easy to underestimate",
    confidence: "Moderate - pollen can vary in calm conditions"
  },
  {
    name: "Thunderstorm Asthma Risk",
    date: "November 18, 2024",
    grassPollen: 72,
    windSpeed: 18,
    windDirection: "Changing",
    temperature: 26,
    humidity: 85,
    riskLevel: "Extreme",
    conditions: "Thunderstorm approaching with high pollen - dangerous combination",
    confidence: "High - enhanced forecasting system active since 2017"
  },
  {
    name: "Southerly Relief",
    date: "November 12, 2024",
    grassPollen: 15,
    windSpeed: 12,
    windDirection: "South", 
    temperature: 19,
    humidity: 58,
    riskLevel: "Low",
    conditions: "Cool southerly winds from ocean clearing the air",
    confidence: "High - southerlies consistently bring relief"
  }
];

export const getRiskLevelColor = (riskLevel: string): string => {
  switch (riskLevel.toLowerCase()) {
    case 'low':
      return 'hsl(142, 76%, 36%)'; // green
    case 'moderate':
      return 'hsl(38, 92%, 50%)'; // amber
    case 'high':
    case 'very high':
      return 'hsl(0, 84%, 60%)'; // red
    case 'extreme':
      return 'hsl(20, 14%, 4%)'; // dark brown
    default:
      return 'hsl(0, 0%, 50%)'; // gray
  }
};

export const getFlowDescription = (flow: string): string => {
  switch (flow) {
    case 'Morning Check-in':
      return 'Start your day with current risk levels and proactive recommendations';
    case 'Activity Planning':
      return 'Get specific timing advice for outdoor activities and alternatives';
    case 'Bad Day Recovery':
      return 'Immediate relief strategies and validation during symptom flare-ups';
    default:
      return 'AI-powered hayfever management for Melbourne residents';
  }
};
