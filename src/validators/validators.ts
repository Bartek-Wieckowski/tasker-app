import { z } from 'zod';

export const registerFormSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().email(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const userSettingsFormInfoSchema = z.object({
  username: z.string().min(2, {
    message: 'Username must be at least 2 characters.',
  }),
  email: z.string().email(),
  imageUrl: z.custom<File>(),
});
export type UserSettingsFormInfoValues = z.infer<typeof userSettingsFormInfoSchema>;

export const userSettingsFormPasswordSchema = z.object({
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});
export type UserSettingsFormPasswordValues = z.infer<typeof userSettingsFormPasswordSchema>;
