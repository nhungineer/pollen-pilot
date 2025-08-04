import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatSessionSchema, insertResponseRatingSchema } from "@shared/schema";
import Anthropic from '@anthropic-ai/sdk';

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || "sk-ant-test-key",
});

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

      // Call Claude API
      const response = await anthropic.messages.create({
        model: DEFAULT_MODEL_STR,
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      });

      const aiResponse = response.content[0].type === 'text' ? response.content[0].text : 'Sorry, I could not process your request.';
      
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
