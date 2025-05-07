import axios from 'axios';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatContext {
  userId: string;
  userRole: 'user' | 'therapist' | 'admin';
  language: string;
  previousMessages: Message[];
  userProfile?: {
    name: string;
    age?: number;
    gender?: string;
    conditions?: string[];
  };
}

export interface ChatResponse {
  message: string;
  confidence: number;
  suggestedActions?: string[];
  requiresEscalation: boolean;
}

export class AIChatService {
  private apiKey: string;
  private baseUrl: string;
  private context: ChatContext;

  constructor(context: ChatContext) {
    this.context = context;
    this.apiKey = import.meta.env.VITE_OPENAI_API_KEY;

    if (!this.apiKey) {
      throw new Error('OpenAI API key is not configured. Please check your environment variables.');
    }

    this.baseUrl = 'https://api.openai.com/v1';
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      if (!this.apiKey) {
        throw new Error('OpenAI API key is not configured');
      }

      console.log('Sending request to OpenAI API...');
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: this.buildMessages(message),
          temperature: 0.7,
          max_tokens: 500,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('OpenAI API Response:', response.data);

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from OpenAI API');
      }

      const aiResponse = response.data.choices[0].message.content;

      // Parse the response to extract confidence and suggested actions
      const parsedResponse = this.parseAIResponse(aiResponse);

      // Check if escalation is needed
      const requiresEscalation = this.checkEscalationNeeded(parsedResponse);

      return {
        message: parsedResponse.message,
        confidence: parsedResponse.confidence,
        suggestedActions: parsedResponse.suggestedActions,
        requiresEscalation,
      };
    } catch (error) {
      console.error('Error sending message to AI:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Invalid API key. Please check your OpenAI API key configuration.');
        } else if (error.response?.status === 404) {
          throw new Error('Invalid API endpoint. Please check the OpenAI API configuration.');
        } else if (error.response?.status === 429) {
          const errorType = error.response?.data?.error?.type;
          if (errorType === 'insufficient_quota') {
            throw new Error(
              'API quota exceeded. Please check your OpenAI account billing and quota.'
            );
          } else {
            throw new Error('Rate limit exceeded. Please try again later.');
          }
        } else if (error.response?.status === 503) {
          throw new Error('OpenAI service is temporarily unavailable. Please try again later.');
        } else {
          throw new Error(`API Error: ${error.response?.data?.error?.message || error.message}`);
        }
      }
      throw new Error('Failed to get AI response. Please try again later.');
    }
  }

  private buildMessages(message: string): Message[] {
    const messages: Message[] = [
      {
        role: 'system',
        content: this.buildSystemPrompt(),
        timestamp: new Date(),
      },
      ...this.context.previousMessages,
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
      },
    ];

    return messages;
  }

  private buildSystemPrompt(): string {
    return `You are a supportive AI assistant for a mental health platform. 
    The user is a ${this.context.userRole} who speaks ${this.context.language}.
    ${this.context.userProfile ? `User profile: ${JSON.stringify(this.context.userProfile)}` : ''}
    
    Guidelines:
    1. Be empathetic and supportive
    2. Use appropriate language for mental health discussions
    3. Never provide medical advice or diagnosis
    4. Escalate to human support if the user expresses:
       - Suicidal thoughts
       - Severe distress
       - Need for immediate help
    5. Suggest appropriate resources and coping strategies
    6. Maintain appropriate boundaries
    7. Respect user privacy and confidentiality`;
  }

  private parseAIResponse(response: string): {
    message: string;
    confidence: number;
    suggestedActions: string[];
  } {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return {
        message: parsed.message,
        confidence: parsed.confidence || 0.8,
        suggestedActions: parsed.suggestedActions || [],
      };
    } catch {
      // If not JSON, return as plain message
      return {
        message: response,
        confidence: 0.8,
        suggestedActions: [],
      };
    }
  }

  private checkEscalationNeeded(response: {
    message: string;
    confidence: number;
    suggestedActions: string[];
  }): boolean {
    const escalationKeywords = [
      'suicide',
      'kill myself',
      'end my life',
      'severe depression',
      'crisis',
      'emergency',
      'immediate help',
      'urgent',
    ];

    const message = response.message.toLowerCase();
    return escalationKeywords.some(keyword => message.includes(keyword));
  }

  updateContext(newContext: Partial<ChatContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  getContext(): ChatContext {
    return { ...this.context };
  }

  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing OpenAI API connection...');
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Connection test successful:', response.data);
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      if (axios.isAxiosError(error)) {
        console.error('Error details:', {
          status: error.response?.status,
          message: error.response?.data?.error?.message,
          type: error.response?.data?.error?.type,
        });
      }
      return false;
    }
  }
}
