
'use server';

/**
 * @fileOverview Provides an AI-powered chat functionality.
 *
 * - generateChatResponse - A function that generates a response from the AI based on chat history.
 * - ChatInput - The input type for the generateChatResponse function.
 * - ChatOutput - The return type for the generateChatResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ChatMessage } from '@/lib/types';

export const ChatInputSchema = z.object({
  history: z.array(z.object({
    senderId: z.enum(['user', 'ai']),
    text: z.string(),
  })).describe("The history of the conversation."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  text: z.string().describe("The AI's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

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
      return { text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment." };
    }
    return result.output;
  }
);

export async function generateChatResponse(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}
