import { z } from 'zod';

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const commentSchema = z.object({
  id: z.number(),
  taskId: z.number(),
  userId: z.number(),
  content: z.string(),
  created: z.string(),
  modified: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;

export interface CommentInput {
  content: string;
}
