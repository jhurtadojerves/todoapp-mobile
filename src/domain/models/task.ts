import { z } from 'zod';

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const taskStatusBriefSchema = z.object({
  id: z.number(),
  name: z.string(),
  color: z.string(),
});

export type TaskStatusBrief = z.infer<typeof taskStatusBriefSchema>;

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const taskSprintBriefSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type TaskSprintBrief = z.infer<typeof taskSprintBriefSchema>;

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const taskSchema = z.object({
  id: z.number(),
  boardId: z.number(),
  sprint: taskSprintBriefSchema.nullable(),
  status: taskStatusBriefSchema.nullable(),
  userId: z.number(),
  assignedToId: z.number().nullable(),
  title: z.string(),
  description: z.string(),
  created: z.string(),
  modified: z.string(),
});

export type Task = z.infer<typeof taskSchema>;

export interface TaskInput {
  title: string;
  description: string;
  statusId: number | null;
  sprintId: number | null;
  assignedToId: number | null;
}

export interface TaskFilters {
  status?: number;
  sprint?: number;
  assignedTo?: number;
}
