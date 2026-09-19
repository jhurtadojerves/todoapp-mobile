import { z, type ZodType } from 'zod';

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Generates the DRF pagination envelope schema for a given item schema. */
export function paginatedSchema<T>(itemSchema: ZodType<T>): ZodType<PaginatedResponse<T>> {
  return z.object({
    count: z.number(),
    next: z.string().nullable(),
    previous: z.string().nullable(),
    results: z.array(itemSchema),
  });
}
