
'use server';

/**
 * @fileOverview Provides an AI-powered chat functionality.
 *
 * - generateChatResponse - A function that generates a response from the AI based on chat history.
 */

import { ai } from '@/ai/genkit';
import {
  ChatInputSchema,
  ChatOutputSchema,
  type ChatInput,
  type ChatOutput,
} from './chat-shared';

const chatPrompt = ai.definePrompt({
  name: 'chatPrompt',
  input: {
    schema: ChatInputSchema,
  },
  output: {
    schema: ChatOutputSchema,
  },
  prompt: `You are a friendly and helpful customer support agent for "Darpan Wears", an online clothing shop. Your goal is to assist users with their questions about products, orders, and policies.

Keep your responses concise and to the point.

Here is the conversation history:
{{#each history}}
{{#if (eq senderId "user")}}User: {{text}}{{/if}}
{{#if (eq senderId "ai")}}AI: {{text}}{{/if}}
{{/each}}
AI:`,
});

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    const result = await chatPrompt(input);
    if (!result || !result.output) {
      return {
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
      };
    }
    return result.output;
  }
);

export async function generateChatResponse(
  input: ChatInput
): Promise<ChatOutput> {
  return chatFlow(input);
}
