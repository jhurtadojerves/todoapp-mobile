import { z } from 'zod';

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const sprintSchema = z.object({
  id: z.number(),
  name: z.string(),
  startDate: z.string().nullable(),
  endDate: z.string().nullable(),
  created: z.string(),
  modified: z.string(),
});

export type Sprint = z.infer<typeof sprintSchema>;

export interface SprintInput {
  name: string;
  startDate: string | null;
  endDate: string | null;
}
