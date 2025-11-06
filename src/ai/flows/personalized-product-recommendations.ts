// src/ai/flows/personalized-product-recommendations.ts
'use server';

/**
 * @fileOverview Provides personalized product recommendations based on user history.
 *
 * - getPersonalizedRecommendations - A function that generates personalized product recommendations.
 * - PersonalizedRecommendationsInput - The input type for the getPersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the getPersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  viewingHistory: z.array(z.string()).describe('List of product IDs viewed by the user.'),
  purchaseHistory: z.array(z.string()).describe('List of product IDs purchased by the user.'),
  inventoryLevels: z.record(z.number()).describe('A map of product IDs to inventory levels'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('List of product IDs recommended for the user.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

const getProductRecommendations = ai.defineTool({
    name: 'getProductRecommendations',
    description: 'Suggest relevant product IDs to the user based on their viewing and purchase history. Consider inventory levels to only suggest products that are in stock.',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: z.array(z.string()).describe('List of product IDs'),
  },
  async (input) => {
    //This function is not implemented and should use an external recommendation service
    return [];
  }
);

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  tools: [getProductRecommendations],
  input: {
    schema: PersonalizedRecommendationsInputSchema,
  },
  output: {
    schema: PersonalizedRecommendationsOutputSchema,
  },
  prompt: `Based on the user's viewing history of these product IDs: {{{viewingHistory}}} and purchase history of these product IDs: {{{purchaseHistory}}}, recommend products they might be interested in. Use the getProductRecommendations tool, be sure to consider the inventory levels: {{{inventoryLevels}}}.`,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await personalizedRecommendationsPrompt(input);
    return output!;
  }
);

export async function getPersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}
