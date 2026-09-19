import { z } from 'zod';

export const boardRoleSchema = z.enum(['owner', 'member']);

export type BoardRole = z.infer<typeof boardRoleSchema>;

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const userBriefSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
});

export type UserBrief = z.infer<typeof userBriefSchema>;

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const boardMembershipSchema = z.object({
  id: z.number(),
  boardId: z.number(),
  user: userBriefSchema,
  role: boardRoleSchema,
  created: z.string(),
});

export type BoardMembership = z.infer<typeof boardMembershipSchema>;

export interface BoardMembershipInput {
  email: string;
  role?: BoardRole;
}
