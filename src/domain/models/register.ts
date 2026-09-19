import { z } from 'zod';

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  password2: string;
  firstName: string;
  lastName: string;
}

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const registeredUserSchema = z.object({
  username: z.string(),
  email: z.string(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

export type RegisteredUser = z.infer<typeof registeredUserSchema>;

/** Generated model: the TS type and the runtime (de)serializer both derive from this one schema. */
export const passwordValidationResultSchema = z.object({
  isValid: z.boolean(),
  errors: z.array(z.string()),
});

export type PasswordValidationResult = z.infer<typeof passwordValidationResultSchema>;
