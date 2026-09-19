import { z } from 'zod';

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const boardStatusSchema = z.object({
  id: z.number(),
  name: z.string(),
  order: z.number(),
  color: z.string(),
});

export type BoardStatus = z.infer<typeof boardStatusSchema>;

export interface BoardStatusInput {
  name: string;
  order: number;
  color: string;
}
