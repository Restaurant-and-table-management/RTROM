import apiClient from '../api/client';

export type ChatbotAction = {
  type: string;
  label?: string;
  target?: string;
  value?: string;
};

export type ChatbotResponse = {
  reply: string;
  sessionId: string;
  intent: string;
  status: string;
  actions: ChatbotAction[];
  quickReplies: string[];
};

export async function sendChatbotMessage(message: string, sessionId?: string): Promise<ChatbotResponse> {
  const response = await apiClient.post('/chatbot/message', { message, sessionId });
  return response.data;
}
