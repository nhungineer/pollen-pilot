import { type User, type InsertUser, type ChatSession, type InsertChatSession, type ResponseRating, type InsertResponseRating } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getChatSession(id: string): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, messages: any[]): Promise<ChatSession>;
  
  createResponseRating(rating: InsertResponseRating): Promise<ResponseRating>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private chatSessions: Map<string, ChatSession>;
  private responseRatings: Map<string, ResponseRating>;

  constructor() {
    this.users = new Map();
    this.chatSessions = new Map();
    this.responseRatings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(id);
  }

  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      ...insertSession,
      id,
      userId: null,
      createdAt: new Date(),
      messages: insertSession.messages || [],
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async updateChatSession(id: string, messages: any[]): Promise<ChatSession> {
    const session = this.chatSessions.get(id);
    if (!session) {
      throw new Error('Chat session not found');
    }
    const updatedSession = { ...session, messages };
    this.chatSessions.set(id, updatedSession);
    return updatedSession;
  }

  async createResponseRating(insertRating: InsertResponseRating): Promise<ResponseRating> {
    const id = randomUUID();
    const rating: ResponseRating = {
      ...insertRating,
      id,
      createdAt: new Date(),
    };
    this.responseRatings.set(id, rating);
    return rating;
  }
}

export const storage = new MemStorage();
