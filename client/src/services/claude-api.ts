import { apiRequest } from "@/lib/queryClient";

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  confidence?: string;
  scenario?: string;
}

export interface ChatSession {
  id: string;
  scenario: string;
  flow: string;
  messages: ChatMessage[];
  createdAt: string;
}

export const createChatSession = async (scenario: string, flow: string): Promise<ChatSession> => {
  const response = await apiRequest('POST', '/api/chat/sessions', {
    scenario,
    flow,
    messages: []
  });
  return response.json();
};

export const sendMessage = async (
  sessionId: string, 
  message: string, 
  scenario: any, 
  flow: string
): Promise<{ message: ChatMessage; session: ChatSession }> => {
  const response = await apiRequest('POST', `/api/chat/sessions/${sessionId}/messages`, {
    message,
    scenario,
    flow
  });
  return response.json();
};

export const rateResponse = async (
  sessionId: string, 
  messageIndex: number, 
  rating: 'positive' | 'negative'
): Promise<void> => {
  await apiRequest('POST', '/api/chat/ratings', {
    sessionId,
    messageIndex,
    rating
  });
};

export const exportChat = async (sessionId: string): Promise<void> => {
  const response = await fetch(`/api/chat/sessions/${sessionId}/export`);
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `pollenpilot-chat-${sessionId}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};
