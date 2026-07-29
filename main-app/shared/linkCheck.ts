import { z } from "zod";

export const LinkCheckVerdictSchema = z.enum([
  "verified",
  "misleading",
  "false",
  "pending",
]);

export const LinkCheckBiasRatingSchema = z.enum(["low", "medium", "high"]);

export const LinkCheckAIResponseSchema = z
  .object({
    verdict: LinkCheckVerdictSchema,
    credibilityScore: z.number().min(0).max(100),
    biasRating: LinkCheckBiasRatingSchema,
    factCheckScore: z.number().min(0).max(100),
    summary: z.string().min(1),
    sourceUrls: z.array(z.string()),
    reasoning: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    publicationDate: z.string().min(1).nullable().optional(),
  })
  .strict();

export const LinkCheckApiResponseSchema = z
  .object({
    id: z.string(),
    url: z.string().url(),
    title: z.string(),
    domain: z.string(),
    publicationDate: z.string().nullable(),
    verdict: LinkCheckVerdictSchema,
    credibilityScore: z.number().int().min(0).max(100),
    biasRating: LinkCheckBiasRatingSchema,
    factCheckScore: z.number().int().min(0).max(100),
    summary: z.string(),
    sourceUrls: z.array(z.string()),
    sourcesCount: z.number().int().min(0),
    checkedAt: z.string(),
    factCheckSources: z.array(z.string()).optional(),
    sources: z.array(z.string()).optional(),
    reasoning: z.string().optional(),
    modelUsed: z.string().optional(),
    searchResults: z.array(z.unknown()).optional(),
  })
  .strict();

export type LinkCheckAIResponse = z.infer<typeof LinkCheckAIResponseSchema>;
export type LinkCheckApiResponse = z.infer<typeof LinkCheckApiResponseSchema>;
export type LinkCheckVerdict = z.infer<typeof LinkCheckVerdictSchema>;
export type LinkCheckBiasRating = z.infer<typeof LinkCheckBiasRatingSchema>;
