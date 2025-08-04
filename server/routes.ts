import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertResponseRatingSchema } from "@shared/schema";
import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "sk-ant-test-key",
});

// Demo response generator for testing without valid API key
function generateDemoResponse(message: string, scenario: any, flow: string): string {
  const isHighRisk = ['high', 'very high', 'extreme'].includes(scenario.riskLevel.toLowerCase());
  
  if (flow === 'Morning Check-in') {
    return isHighRisk 
      ? `Good morning! Today's looking challenging with ${scenario.riskLevel.toLowerCase()} pollen levels (${scenario.grassPollen} grains/m³). Those ${scenario.windDirection.toLowerCase()} winds at ${scenario.windSpeed}km/h are bringing grass pollen from the countryside.

**Immediate actions:**
• Take antihistamine NOW (before symptoms start)
• Use preventative nasal spray
• Avoid outdoor activities 5am-10am (peak pollen release)
• Keep windows closed, use air conditioning if possible

Based on 20+ years of Melbourne data, conditions like these typically persist until evening southerly change. Would you like specific advice for any planned activities today?`
      : `Good morning! Great news - today's looking much better with ${scenario.riskLevel.toLowerCase()} pollen levels. The ${scenario.windDirection.toLowerCase()} winds are helping keep the air cleaner.

**Today's opportunities:**
• Good conditions for outdoor activities
• Safe to open windows for fresh air  
• Light exercise outdoors should be fine
• Still monitor for any wind changes

This matches typical ${scenario.windDirection.toLowerCase()} wind patterns we see in Melbourne. Perfect day to get outside! Any specific activities you're planning?`;
  }
  
  if (flow === 'Activity Planning') {
    if (message.toLowerCase().includes('run') || message.toLowerCase().includes('exercise')) {
      return isHighRisk
        ? `Running this morning? I'd strongly advise against it with ${scenario.grassPollen} grains/m³ and those hot ${scenario.windDirection.toLowerCase()} winds. Peak pollen release is 5am-10am.

**Better alternatives:**
• Wait until after 4pm when conditions improve
• Indoor gym or treadmill today
• If you must go out: wear sports mask, sunglasses, shower immediately after

Tomorrow's forecast looking better with possible southerly change. Would you like me to suggest the best time window for later today?`
        : `Perfect timing for a run! With ${scenario.grassPollen} grains/m³ and ${scenario.windDirection.toLowerCase()} winds, conditions are ideal for outdoor exercise.

**Best approach:**
• Early morning (6-8am) or late afternoon (4-6pm) are optimal
• ${scenario.windDirection.toLowerCase()} winds will keep pollen levels down
• Great visibility with ${scenario.humidity}% humidity

Melbourne's ${scenario.windDirection.toLowerCase()} winds consistently bring relief from ocean air. Enjoy your run! Need route suggestions for areas with good air quality?`;
    }
  }
  
  if (flow === 'Bad Day Recovery') {
    return `I understand you're feeling rough - itchy eyes and runny nose are classic hayfever symptoms, especially with today's ${scenario.riskLevel.toLowerCase()} conditions.

**Immediate relief:**
• Antihistamine if you haven't taken one yet
• Saline nasal rinse to clear pollen
• Cool compress on eyes
• Stay indoors with windows closed

**For the rest of your day:**
• Avoid outdoor activities until evening
• Change clothes if you've been outside
• Shower before bed to remove pollen

You're not alone - many Melbourne residents struggle on days like this with ${scenario.grassPollen} grains/m³. Based on wind patterns, relief should come with tonight's southerly change. How are you feeling now?`;
  }
  
  return `Thanks for your question about "${message}". With current ${scenario.riskLevel.toLowerCase()} pollen conditions in Melbourne (${scenario.grassPollen} grains/m³), I'd recommend staying cautious. The ${scenario.windDirection.toLowerCase()} winds at ${scenario.windSpeed}km/h are typical for this time of year. 

Would you like specific advice for your situation? I can help with timing, symptoms, or activity planning based on 20+ years of Melbourne pollen data.`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new chat session
  app.post("/api/chat/sessions", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid request data", error: error.message });
    }
  });

  // Send message to Claude and update session
  app.post("/api/chat/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message, scenario, flow } = req.body;

      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      const currentMessages = Array.isArray(session.messages) ? session.messages : [];
      
      // Add user message
      const userMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };
      currentMessages.push(userMessage);

      // Create system prompt with Melbourne context and scenario data
      const systemPrompt = `You are PollenPilot, Melbourne's AI hayfever management assistant.

CURRENT CONDITIONS: ${scenario.conditions}
Grass pollen: ${scenario.grassPollen} grains/m³ (${scenario.riskLevel})
Wind: ${scenario.windSpeed}km/h ${scenario.windDirection}  
Temperature: ${scenario.temperature}°C, Humidity: ${scenario.humidity}%
Confidence: ${scenario.confidence}
Date: ${scenario.date}

MELBOURNE CONTEXT:
- Peak pollen season: late November/early December
- Rye grass main trigger, plus birch/elm/cypress
- Pollen classification: 0-19 (LOW), 20-49 (MODERATE), 50-99 (HIGH), ≥100 (EXTREME)
- Northerly winds = danger (countryside pollen), Southerly = relief (ocean air)
- Thunderstorm asthma risk: pollen >50 + humidity >80% + storms
- 20+ years Melbourne pollen data available for patterns
- Hot northerly winds bring pollen from countryside areas
- Cool southerly winds bring pollen-free ocean air

CURRENT FLOW: ${flow}

GUIDELINES:
- Be conversational, empathetic, not clinical
- Always give actionable advice with specific timing
- Reference data points for trust ("based on 20 years data...")
- Include confidence levels in recommendations
- Suggest alternatives when saying no to activities
- Use Melbourne landmarks/areas naturally
- For Bad Day Recovery: validate feelings, immediate relief, forward planning
- For Morning Check-in: proactive recommendations, preventative measures
- For Activity Planning: specific timing advice, alternative suggestions

Respond as PollenPilot would to help this Melbourne resident manage their hayfever effectively.`;

      let aiResponse: string;
      
      // Call Claude API with fallback for demo
      try {
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: 'user', content: message }],
        });
        aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not process your request.';
      } catch (apiError: any) {
        // Fallback response for demo purposes when API key is invalid
        if (apiError.status === 401) {
          aiResponse = generateDemoResponse(message, scenario, flow);
        } else {
          throw apiError;
        }
      }
      
      // Add AI response
      const aiMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
        confidence: 'High', // Could be derived from scenario or response analysis
        scenario: scenario.name
      };
      currentMessages.push(aiMessage);

      // Update session with new messages
      const updatedSession = await storage.updateChatSession(sessionId, currentMessages);
      
      res.json({
        message: aiMessage,
        session: updatedSession
      });

    } catch (error: any) {
      console.error('Claude API error:', error);
      res.status(500).json({ 
        message: "Failed to process message", 
        error: error.message 
      });
    }
  });

  // Rate a response
  app.post("/api/chat/ratings", async (req, res) => {
    try {
      const validatedData = insertResponseRatingSchema.parse(req.body);
      const rating = await storage.createResponseRating(validatedData);
      res.json(rating);
    } catch (error: any) {
      res.status(400).json({ message: "Invalid rating data", error: error.message });
    }
  });

  // Export chat session
  app.get("/api/chat/sessions/:sessionId/export", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Chat session not found" });
      }

      const exportData = {
        sessionId: session.id,
        scenario: session.scenario,
        flow: session.flow,
        createdAt: session.createdAt,
        messages: session.messages,
        exportedAt: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="pollenpilot-chat-${sessionId}.json"`);
      res.json(exportData);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to export chat", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
