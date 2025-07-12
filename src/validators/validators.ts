import { z } from "zod";
import { TFunction } from "i18next";

export const registerFormSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(2, {
      message: t("registerPage.usernameMinLength"),
    }),
    email: z.string().email({
      message: t("registerPage.emailInvalid"),
    }),
    password: z
      .string()
      .min(8, { message: t("registerPage.passwordMinLength") }),
  });

export const loginFormSchema = (t: TFunction) =>
  z.object({
    email: z.string().email({
      message: t("loginPage.emailInvalid"),
    }),
    password: z.string().min(8, { message: t("loginPage.passwordMinLength") }),
  });

export const userSettingsFormInfoSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(2, {
      message: t("userSettingsForm.usernameMinLength"),
    }),
    email: z.string().email({
      message: t("userSettingsForm.emailInvalid"),
    }),
    imageUrl: z.custom<File>(),
  });

export const userSettingsFormPasswordSchema = (t: TFunction) =>
  z.object({
    password: z
      .string()
      .min(8, { message: t("userSettingsForm.passwordMinLength") }),
  });

export const todoFormSchema = (t: TFunction) =>
  z.object({
    todo: z
      .string()
      .min(2, {
        message: t("todos.todoMinLength"),
      })
      .max(70, {
        message: t("todos.todoMaxLength"),
      }),
    todoMoreContent: z.optional(z.string()),
    imageUrl: z.custom<File>(),
  });

export type RegisterFormValues = z.infer<ReturnType<typeof registerFormSchema>>;
export type LoginFormValues = z.infer<ReturnType<typeof loginFormSchema>>;
export type UserSettingsFormInfoValues = z.infer<
  ReturnType<typeof userSettingsFormInfoSchema>
>;
export type UserSettingsFormPasswordValues = z.infer<
  ReturnType<typeof userSettingsFormPasswordSchema>
>;
export type TodoFormValues = z.infer<ReturnType<typeof todoFormSchema>>;
