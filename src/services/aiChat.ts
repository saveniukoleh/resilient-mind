import { FirebaseError } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';
import app from '@/config/firebase';

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
    name?: string;
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

interface ChatRequest {
  message: string;
  language?: string;
  userRole?: ChatContext['userRole'];
  userProfile?: ChatContext['userProfile'];
  previousMessages?: Array<Pick<Message, 'role' | 'content'>>;
}

const handleAIChat = httpsCallable<ChatRequest, ChatResponse>(getFunctions(app), 'handleAIChat');

export class AIChatService {
  private context: ChatContext;

  constructor(context: ChatContext) {
    this.context = context;
  }

  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      const response = await handleAIChat(this.buildRequest(message));

      return {
        message: response.data.message,
        confidence: response.data.confidence ?? 0.8,
        suggestedActions: response.data.suggestedActions ?? [],
        requiresEscalation: response.data.requiresEscalation,
      };
    } catch (error) {
      console.error('Error sending message to AI:', error);
      throw new Error(this.readError(error));
    }
  }

  updateContext(newContext: Partial<ChatContext>): void {
    this.context = { ...this.context, ...newContext };
  }

  getContext(): ChatContext {
    return { ...this.context };
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.sendMessage('Hello');
      return true;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  private buildRequest(message: string): ChatRequest {
    const roles = ['user', 'therapist', 'admin'] as const;
    const userRole = roles.includes(this.context.userRole) ? this.context.userRole : 'user';
    const language =
      typeof this.context.language === 'string' && this.context.language
        ? this.context.language.slice(0, 32)
        : 'en';
    const request: ChatRequest = {
      message: message.slice(0, 4000),
      language,
      userRole,
      previousMessages: this.historyBefore(message),
    };
    const userProfile = this.sanitizedProfile();
    if (userProfile) {
      request.userProfile = userProfile;
    }
    return request;
  }

  private sanitizedProfile(): ChatContext['userProfile'] | undefined {
    const profile = this.context.userProfile as
      | (ChatContext['userProfile'] & Record<string, unknown>)
      | undefined;
    if (!profile || typeof profile !== 'object') {
      return undefined;
    }

    const sanitized: ChatContext['userProfile'] = { name: '' };
    let hasName = false;
    if (typeof profile.name === 'string' && profile.name.trim()) {
      sanitized.name = profile.name.trim().slice(0, 200);
      hasName = true;
    }
    if (typeof profile.age === 'number' && Number.isFinite(profile.age)) {
      sanitized.age = profile.age;
    }
    if (typeof profile.gender === 'string' && profile.gender.trim()) {
      sanitized.gender = profile.gender.trim().slice(0, 50);
    }
    if (Array.isArray(profile.conditions)) {
      const conditions = profile.conditions
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .slice(0, 20)
        .map(item => item.trim().slice(0, 100));
      if (conditions.length > 0) {
        sanitized.conditions = conditions;
      }
    }

    if (!hasName && sanitized.age === undefined && !sanitized.gender && !sanitized.conditions) {
      return undefined;
    }
    if (!hasName) {
      delete sanitized.name;
    }
    return sanitized;
  }

  private historyBefore(message: string): Array<Pick<Message, 'role' | 'content'>> {
    const history = this.context.previousMessages.filter(item => item.role !== 'system');
    const last = history[history.length - 1];
    const prior =
      last?.role === 'user' && last.content === message ? history.slice(0, -1) : history;

    return prior.slice(-20).map(item => ({
      role: item.role,
      content: item.content,
    }));
  }

  private readError(error: unknown): string {
    if (error instanceof FirebaseError) {
      if (error.code === 'functions/unauthenticated') {
        return 'Sign in to use the chatbot.';
      }
      if (error.code === 'functions/resource-exhausted') {
        return 'The AI service is rate limited or out of quota. Try again later.';
      }
      if (error.code === 'functions/unavailable' || error.code === 'functions/not-found') {
        return 'The chatbot service is not deployed yet. Deploy the handleAIChat function and try again.';
      }
      return error.message || 'Failed to get an AI response. Please try again later.';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Failed to get an AI response. Please try again later.';
  }
}
