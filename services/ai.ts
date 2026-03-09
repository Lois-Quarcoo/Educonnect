import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the API with the key provided in .env
// Note: In a production mobile app, the API key should NEVER be bundled directly. It should funnel through a secure backend route.
// For this prototype, we'll initialize it locally.
const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export type ChatMessage = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  suggestions?: string[];
  lessonCard?: { subject: string; title: string; meta: string; id: string; type: 'video' | 'quiz' };
};

export const generateTutorResponse = async (
  conversationHistory: ChatMessage[],
  newMessageText: string
): Promise<ChatMessage> => {
  if (!API_KEY) {
    return {
      id: Date.now().toString(),
      role: 'ai',
      text: "I'm sorry, my AI brain (Gemini API Key) is not connected yet! Please add EXPO_PUBLIC_GEMINI_API_KEY to your .env file.",
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Convert history to Gemini format, omitting the very first system instructions if present
    const context = conversationHistory.filter(msg => !msg.lessonCard).map(msg => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.text}`).join('\n');
    
    const prompt = `You are an expert, encouraging AI Tutor named Spark for the EduConnect app. 
Your goal is to be incredibly helpful, concise, and explain concepts simply to students.
Here is the conversation history:
${context}

Student: ${newMessageText}
Tutor:`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return {
      id: Date.now().toString(),
      role: 'ai',
      text: text,
      // For this prototype, we generate 2 contextual suggestions by default based on simple keyword matching, 
      // or just provide standard follow-ups to keep the student engaged.
      suggestions: ['Tell me more', 'Give me an example', 'Quiz me on this'],
    };
  } catch (error) {
    console.error('Gemini Error:', error);
    return {
      id: Date.now().toString(),
      role: 'ai',
      text: "I encountered an error while thinking. Could you try asking that again?",
    };
  }
};
