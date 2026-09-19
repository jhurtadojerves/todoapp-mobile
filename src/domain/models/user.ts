import { z } from 'zod';

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const userProfileSchema = z.object({
  bio: z.string(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  dateJoined: z.string().optional(),
  // The real API can return null here even though the OpenAPI schema marks it
  // required (a user without a profile row) — kept nullable.
  profile: userProfileSchema.nullable(),
});

export type User = z.infer<typeof userSchema>;
