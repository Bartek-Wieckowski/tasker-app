import { describe, it, expect } from "vitest";
import { mockSupabase } from "../../setup";
import { getGlobalTodos } from "@/api/apiGlobalTodos";

describe("apiGlobalTodos", () => {
  describe("getGlobalTodos()", () => {
    it("should successfully get user global todos ordered by created_at desc", async () => {
      const mockTodos = [
        {
          id: "todo-1",
          user_id: "user-123",
          title: "Buy groceries",
          completed: false,
          created_at: "2024-01-02T10:00:00Z",
        },
        {
          id: "todo-2",
          user_id: "user-123",
          title: "Walk the dog",
          completed: true,
          created_at: "2024-01-01T10:00:00Z",
        },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: mockTodos,
                error: null,
              }),
          }),
        }),
      }));

      const result = await getGlobalTodos("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("global_todos");
      expect(result).toEqual(mockTodos);
    });

    it("should return empty array when user has no global todos", async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: [],
                error: null,
              }),
          }),
        }),
      }));

      const result = await getGlobalTodos("user-123");
      expect(result).toEqual([]);
    });

    it("should throw GET_GLOBAL_TODOS_ERROR when database query fails", async () => {
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: null,
                error: {
                  code: "PGRST116",
                  message: "Database error",
                },
              }),
          }),
        }),
      }));

      await expect(getGlobalTodos("user-123")).rejects.toEqual({
        code: "GET_GLOBAL_TODOS_ERROR",
      });
    });

    it("should work with different user IDs", async () => {
      const mockTodos = [
        {
          id: "todo-3",
          user_id: "user-456",
          title: "Read a book",
          completed: false,
          created_at: "2024-01-03T15:30:00Z",
        },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () =>
              Promise.resolve({
                data: mockTodos,
                error: null,
              }),
          }),
        }),
      }));

      const result = await getGlobalTodos("user-456");
      expect(result).toEqual(mockTodos);
    });
  });
});
