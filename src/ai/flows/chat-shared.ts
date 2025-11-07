import { z } from 'genkit';

/**
 * @fileOverview Shared schemas and types for the AI chat flow.
 * This file does NOT use 'use server' and can safely export objects and types.
 */

export const ChatInputSchema = z.object({
  history: z
    .array(
      z.object({
        senderId: z.enum(['user', 'ai']),
        text: z.string(),
      })
    )
    .describe('The history of the conversation.'),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

export const ChatOutputSchema = z.object({
  text: z.string().describe("The AI's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
