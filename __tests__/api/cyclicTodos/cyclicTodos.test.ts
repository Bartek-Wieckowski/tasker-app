import { describe, it, expect } from "vitest";
import { mockSupabase } from "../../setup";
import { getCyclicTodos } from "@/api/apiCyclicTodos";

describe("apiCyclicTodos", () => {
  describe("getCyclicTodos()", () => {
    it("should successfully get user cyclic todos ordered by created_at desc", async () => {
      const mockTodos = [
        {
          id: "todo-1",
          user_id: "user-123",
          todo: "Buy groceries",
          created_at: "2024-01-02T10:00:00Z",
        },
        {
          id: "todo-2",
          user_id: "user-123",
          todo: "Walk the dog",
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

      const result = await getCyclicTodos("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("cyclic_todos");
      expect(result).toEqual(mockTodos);
    });

    it("should return empty array when user has no cyclic todos", async () => {
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

      const result = await getCyclicTodos("user-123");
      expect(result).toEqual([]);
    });

    it("should throw GET_CYCLIC_TODOS_ERROR when database query fails", async () => {
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

      await expect(getCyclicTodos("user-123")).rejects.toEqual({
        code: "GET_CYCLIC_TODOS_ERROR",
      });
    });

    it("should work with different user IDs", async () => {
      const mockTodos = [
        {
          id: "todo-3",
          user_id: "user-456",
          todo: "Read a book",
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

      const result = await getCyclicTodos("user-456");
      expect(result).toEqual(mockTodos);
    });
  });
});
