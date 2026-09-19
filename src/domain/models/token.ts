import { z } from 'zod';

export interface UserCredentials {
  email: string;
  password: string;
}

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const tokenPairSchema = z.object({
  access: z.string(),
  refresh: z.string(),
});

export type TokenPair = z.infer<typeof tokenPairSchema>;
