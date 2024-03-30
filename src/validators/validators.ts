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

export const todoFormSchema = z.object({
  todo: z
    .string()
    .min(2, {
      message: 'Todo item must be at least 2 characters.',
    })
    .max(70, {
      message: 'Todo item cannot exceed 40 characters. If you want to add more content, use the description field',
    }),
  todoMoreContent: z.optional(z.string()),
  imageUrl: z.custom<File>(),
});

export type TodoFormValues = z.infer<typeof todoFormSchema>;
