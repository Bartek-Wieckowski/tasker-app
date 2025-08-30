import { z } from "zod";
import { TFunction } from "i18next";

export const registerFormSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(2, {
      message: t("common.usernameMinLength"),
    }),
    email: z.string().email({
      message: t("common.emailInvalid"),
    }),
    password: z.string().min(8, { message: t("common.passwordMinLength") }),
  });

export const loginFormSchema = (t: TFunction) =>
  z.object({
    email: z.string().email({
      message: t("common.emailInvalid"),
    }),
    password: z.string().min(8, { message: t("common.passwordMinLength") }),
  });

export const userSettingsFormInfoSchema = (t: TFunction) =>
  z.object({
    username: z.string().min(2, {
      message: t("common.usernameMinLength"),
    }),
    email: z.string().email({
      message: t("common.emailInvalid"),
    }),
    imageUrl: z.custom<File>(),
  });

export const userSettingsFormPasswordSchema = (t: TFunction) =>
  z.object({
    password: z.string().min(8, { message: t("common.passwordMinLength") }),
  });

export const todoFormSchema = (t: TFunction) =>
  z.object({
    todo: z
      .string()
      .min(2, {
        message: t("common.todoMinLength"),
      })
      .max(70, {
        message: t("common.todoMaxLength"),
      }),
    todo_more_content: z.optional(
      z.string().max(500, {
        message: t("common.todoMoreContentMaxLength"),
      })
    ),
    imageFile: z.optional(z.custom<File>()),
  });

export const delegatedTodoFormSchema = (t: TFunction) =>
  z.object({
    todo: z.string().min(2, {
      message: t("common.todoTaskIsRequired"),
    }),
  });

export const globalTodoFormSchema = (t: TFunction) =>
  z.object({
    todo: z.string().min(2, {
      message: t("common.todoTaskIsRequired"),
    }),
  });

export const cyclicTodoFormSchema = (t: TFunction) =>
  z.object({
    todo: z.string().min(2, {
      message: t("common.todoTaskIsRequired"),
    }),
  });

export const createTableSchema = (t: TFunction) =>
  z.object({
    tableName: z
      .string()
      .min(2, {
        message: t("coopTodos.tableNameMinLength"),
      })
      .max(25, {
        message: t("coopTodos.tableNameMaxLength"),
      }),
    description: z
      .string()
      .max(75, {
        message: t("coopTodos.descriptionMaxLength"),
      })
      .optional(),
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
export type DelegatedTodoFormValues = z.infer<
  ReturnType<typeof delegatedTodoFormSchema>
>;
export type GlobalTodoFormValues = z.infer<
  ReturnType<typeof globalTodoFormSchema>
>;
export type CyclicTodoFormValues = z.infer<
  ReturnType<typeof cyclicTodoFormSchema>
>;
export type CreateTableValues = z.infer<ReturnType<typeof createTableSchema>>;
