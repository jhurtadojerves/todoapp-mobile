import { z } from 'zod';

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const boardSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  userId: z.number(),
  created: z.string(),
  modified: z.string(),
});

export type Board = z.infer<typeof boardSchema>;

export interface BoardInput {
  name: string;
  description: string;
}
