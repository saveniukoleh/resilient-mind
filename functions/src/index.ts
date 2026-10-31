import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { OpenAI } from 'openai';
import { z } from 'zod';

admin.initializeApp();

const openaiApiKey = defineSecret('OPENAI_API_KEY');

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(4000),
});

const requestSchema = z.object({
  message: z.string().min(1).max(4000),
  language: z.string().max(32).optional(),
  userRole: z.enum(['user', 'therapist', 'admin']).nullish(),
  userProfile: z
    .object({
      name: z.string().max(200).nullish(),
      age: z.number().nullish(),
      gender: z.string().max(50).nullish(),
      conditions: z.array(z.string().max(100)).max(20).nullish(),
    })
    .nullish(),
  previousMessages: z.array(messageSchema).max(20).optional(),
});

const escalationKeywords = [
  'suicide',
  'kill myself',
  'end my life',
  'severe depression',
  'crisis',
  'emergency',
  'immediate help',
  'urgent',
  'самогуб',
  'суїцид',
  'не хочу жити',
  'покінчити з життям',
  'суицид',
  'самоубий',
  'не хочу жить',
  'покончить с собой',
];

function buildSystemPrompt(input: z.infer<typeof requestSchema>): string {
  return `You are a supportive AI assistant for a mental health platform for people affected by the war in Ukraine.
The user role is ${input.userRole ?? 'user'}.
${input.userProfile ? `User profile: ${JSON.stringify(input.userProfile)}` : ''}

Reply in the same language as the user's latest message, whichever language that is. Earlier replies and the profile language hint ("${input.language ?? 'unknown'}") do not override it. Do not mention this rule or comment on the language. Translate only when the user explicitly asks for a translation.

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

export const handleAIChat = functions
  .runWith({
    secrets: [openaiApiKey],
    // The default Compute Engine account was never created for this project.
    serviceAccount: 'resilient-mind-cca45@appspot.gserviceaccount.com',
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Sign in to use the chatbot.');
    }

    const parsed = requestSchema.safeParse(data);
    if (!parsed.success) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid chat request');
    }

    const input = parsed.data;
    const openai = new OpenAI({ apiKey: openaiApiKey.value() });

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        max_tokens: 500,
        messages: [
          { role: 'system', content: buildSystemPrompt(input) },
          ...(input.previousMessages ?? []).map(message => ({
            role: message.role,
            content: message.content,
          })),
          { role: 'user', content: input.message },
        ],
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new functions.https.HttpsError('internal', 'Invalid response from the AI service');
      }

      let message = content;
      let confidence = 0.8;
      let suggestedActions: string[] = [];
      try {
        const json = JSON.parse(content) as {
          message?: string;
          confidence?: number;
          suggestedActions?: string[];
        };
        if (typeof json.message === 'string') {
          message = json.message;
          confidence = typeof json.confidence === 'number' ? json.confidence : 0.8;
          suggestedActions = Array.isArray(json.suggestedActions) ? json.suggestedActions : [];
        }
      } catch {
        // The model returned plain text, which is the normal case.
      }

      const lowered = message.toLowerCase();
      return {
        message,
        confidence,
        suggestedActions,
        requiresEscalation: escalationKeywords.some(keyword => lowered.includes(keyword)),
      };
    } catch (error) {
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }

      const status = (error as { status?: number }).status;
      const detail = error instanceof Error ? error.message : 'Unknown AI error';
      console.error('AI chat failed', { status, detail });

      if (status === 401) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'The OpenAI API key was rejected. Create a new key and update the Firebase secret.'
        );
      }
      if (status === 429) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'The AI service is rate limited or out of quota. Try again later.'
        );
      }
      if (status === 404) {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'The configured AI model is unavailable.'
        );
      }
      throw new functions.https.HttpsError(
        'internal',
        'Failed to get an AI response. Please try again later.'
      );
    }
  });
