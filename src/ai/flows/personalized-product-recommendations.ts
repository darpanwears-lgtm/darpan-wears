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

const personalizedRecommendationsPrompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {
    schema: PersonalizedRecommendationsInputSchema,
  },
  output: {
    schema: PersonalizedRecommendationsOutputSchema,
  },
  prompt: `Based on the user's viewing history of these product IDs: {{{viewingHistory}}} and purchase history of these product IDs: {{{purchaseHistory}}}, recommend a list of product IDs they might be interested in. Only recommend products that have inventory levels greater than 0 based on this data: {{{inventoryLevels}}}.`,
});

const personalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const result = await personalizedRecommendationsPrompt(input);
    if (!result || !result.output) {
      return { recommendations: [] };
    }
    return result.output;
  }
);

export async function getPersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return personalizedRecommendationsFlow(input);
}
