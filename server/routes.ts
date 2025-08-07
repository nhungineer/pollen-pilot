import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertChatSessionSchema,
  insertResponseRatingSchema,
} from "@shared/schema";
import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";

const anthropic = new Anthropic({
  apiKey:
    process.env.ANTHROPIC_API_KEY ||
    process.env.CLAUDE_API_KEY ||
    "sk-ant-test-key",
});

// Demo response generator for testing without valid API key
function generateDemoResponse(
  message: string,
  scenario: any,
  flow: string,
): string {
  const isHighRisk = ["high", "very high", "extreme"].includes(
    scenario.riskLevel.toLowerCase(),
  );

  if (flow === "Morning Check-in") {
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

  if (flow === "Activity Planning") {
    if (
      message.toLowerCase().includes("run") ||
      message.toLowerCase().includes("exercise")
    ) {
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

  if (flow === "Bad Day Recovery") {
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
      res
        .status(400)
        .json({ message: "Invalid request data", error: error.message });
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

      const currentMessages = Array.isArray(session.messages)
        ? session.messages
        : [];

      // Add user message
      const userMessage = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };
      currentMessages.push(userMessage);

      // Create system prompt with Melbourne context and scenario data
      const createSystemPrompt = (
        scenario: PollenScenario,
        currentTime: string,
      ) => {
        // Define consistent decision rules for all outdoor activities
        const activityRules = {
          low: {
            safeWindows: ["06:00-09:00", "18:00-06:00"],
            avoidTimes: ["10:00-17:00"],
            windowSafe: "after 18:00",
          },
          moderate: {
            safeWindows: ["06:00-08:00", "20:00-06:00"],
            avoidTimes: ["08:00-20:00"],
            windowSafe: "after 20:00",
          },
          high: {
            safeWindows: ["22:00-06:00"],
            avoidTimes: ["06:00-22:00"],
            windowSafe: "after 22:00",
          },
          veryHigh: {
            safeWindows: ["23:00-05:00"],
            avoidTimes: ["05:00-23:00"],
            windowSafe: "after 23:00",
          },
          extreme: {
            safeWindows: [],
            avoidTimes: ["all day"],
            windowSafe: "never",
          },
        };

        const currentRule =
          activityRules[
            scenario.riskLevel
              .toLowerCase()
              .replace(" ", "")
              .replace("-", "") as keyof typeof activityRules
          ] || activityRules.moderate;

        // Adjust recommendations based on humidity
        let humidityNote = "";
        if (scenario.humidity >= 70) {
          humidityNote = `High humidity (${scenario.humidity}%) keeps pollen grounded - conditions better than expected! `;
        } else if (scenario.humidity <= 40) {
          humidityNote = `Low humidity (${scenario.humidity}%) keeps pollen airborne longer - extra caution needed! `;
        }

        return `You are PollenPilot, Melbourne's AI hayfever management assistant.

      CURRENT TIME: ${currentTime}
      CURRENT CONDITIONS: ${scenario.conditions}
      Grass pollen: ${scenario.grassPollen} grains/m³ (${scenario.riskLevel})
      Wind: ${scenario.windSpeed}km/h ${scenario.windDirection}  
      Temperature: ${scenario.temperature}°C, Humidity: ${scenario.humidity}%
      Date: ${scenario.date}

   MELBOURNE POLLEN SCIENCE (FIXED TIMING):
   - Classification: 0-19 (LOW), 20-49 (MODERATE), 50-99 (HIGH), 100+ (EXTREME)
   - PRIMARY PEAK: 5am-10am (thermal release from grass)
   - SECONDARY PEAK: 6pm-9pm (evening thermal currents)
   - LOWEST LEVELS: 10pm-5am (pollen settles overnight)
   - Hot northerly winds = danger (bring countryside pollen)
   - Cool southerly winds = relief (ocean air)
   - HUMIDITY EFFECTS: High humidity (70%+) normally keeps pollen grounded = BETTER conditions, Low humidity (<30%) allows pollen to stay airborne longer = worse symptoms
   - EXCEPTION - Thunderstorm asthma: pollen 50+ + humidity 80+ + approaching storms = EXTREME DANGER (humidity breaks pollen into smaller fragments that penetrate deeper into lungs)

      OUTDOOR ACTIVITY DECISION RULES (ALWAYS FOLLOW EXACTLY):
      Risk Level: ${scenario.riskLevel} (${scenario.grassPollen} grains/m³)

      SAFE TIMES FOR ALL OUTDOOR ACTIVITIES:
      ${
        currentRule.safeWindows.length > 0
          ? `- Safe windows: ${currentRule.safeWindows.join(" and ")}
        - AVOID: ${currentRule.avoidTimes.join(", ")}`
          : `- NO SAFE TIMES - stay indoors
        - ALL outdoor activities discouraged`
      }

      SPECIFIC ACTIVITY GUIDANCE:
      - Running/Exercise: ${
        currentRule.safeWindows.length > 0
          ? `Safe during: ${currentRule.safeWindows[0]}`
          : "Indoor gym only - too risky outside"
      }
      - Picnics/Outdoor dining: ${
        currentRule.safeWindows.length > 0
          ? `Plan for: ${currentRule.safeWindows.slice(-1)[0]}`
          : "Indoor venues only"
      }  
      - Window opening: ${
        currentRule.windowSafe !== "never"
          ? `Safe ${currentRule.windowSafe}`
          : "Keep closed - use air conditioning"
      }
      - Walking/commuting: ${
        currentRule.safeWindows.length > 0
          ? "Brief essential trips only during safe windows"
          : "Minimize exposure - mask recommended"
      }

      ALTERNATIVES FOR HIGH-RISK TIMES:
      - Indoor gyms, shopping centers, libraries
      - Covered/enclosed outdoor dining
      - Air-conditioned transport
      - Indoor entertainment venues

      RESPONSE RULES:
      - Maximum 40 words total
      - One clear recommendation with specific time
      - Use emoji for visual impact
      - NO asterisks, bullets, or formatting
      - For ANY outdoor activity: state exact safe times from rules above
      - If current time is in avoid period: suggest next safe window
      - If current time is safe: confirm and give end time
      - Always provide indoor alternative for high-risk activities
      - Stay focused on hayfever management only

      Current flow context: ${scenario.conditions}`;
      };

      // Usage in your route handler:
      const currentTime = new Date().toLocaleTimeString("en-AU", {
        timeZone: "Australia/Melbourne",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      const systemPrompt = createSystemPrompt(scenario, currentTime);

      let aiResponse: string;

      // Call Claude API with fallback for demo
      try {
        const response = await anthropic.messages.create({
          model: DEFAULT_MODEL_STR,
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: "user", content: message }],
        });
        aiResponse =
          response.content[0].type === "text"
            ? response.content[0].text
            : "Sorry, I could not process your request.";
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
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
        confidence: "High", // Could be derived from scenario or response analysis
        scenario: scenario.name,
      };
      currentMessages.push(aiMessage);

      // Update session with new messages
      const updatedSession = await storage.updateChatSession(
        sessionId,
        currentMessages,
      );

      res.json({
        message: aiMessage,
        session: updatedSession,
      });
    } catch (error: any) {
      console.error("Claude API error:", error);
      res.status(500).json({
        message: "Failed to process message",
        error: error.message,
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
      res
        .status(400)
        .json({ message: "Invalid rating data", error: error.message });
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
        exportedAt: new Date().toISOString(),
      };

      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="pollenpilot-chat-${sessionId}.json"`,
      );
      res.json(exportData);
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Failed to export chat", error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
