import { z } from 'zod';

/** Success envelope matching Nest TransformInterceptor */
export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    statusCode: z.number().int(),
    path: z.string(),
    method: z.string(),
    timestamp: z.string(),
    data: dataSchema,
  });

export type ApiSuccess<T> = {
  success: true;
  statusCode: number;
  path: string;
  method: string;
  timestamp: string;
  data: T;
};
