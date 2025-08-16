import { describe, it, expect, vi } from "vitest";
import {
  getUserTodos,
  getTodosFromDay,
  getTodoById,
  searchTodos,
  uploadImageAndGetUrl,
  countImageReferences,
  isLastImageReference,
  getFilePathFromUrl,
  updateTodoCompletionStatus,
} from "@/api/apiTodos";
import { mockSupabase } from "../../setup";
import { TodoRow, TodoSearchResult } from "@/types/types";

describe("apiTodos", () => {
  describe("getUserTodos()", () => {
    it("should successfully get user todos ordered by created_at desc", async () => {
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

      const result = await getUserTodos("user-123");

      expect(mockSupabase.from).toHaveBeenCalledWith("todos");
      expect(result).toEqual(mockTodos);
    });

    it("should return empty array when user has no todos", async () => {
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

      const result = await getUserTodos("user-123");
      expect(result).toEqual([]);
    });

    it("should throw GET_USER_TODOS_ERROR when database query fails", async () => {
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

      await expect(getUserTodos("user-123")).rejects.toEqual({
        code: "GET_USER_TODOS_ERROR",
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

      const result = await getUserTodos("user-456");
      expect(result).toEqual(mockTodos);
    });
  });

  describe("getTodosFromDay()", () => {
    const mockUser = {
      accountId: "user-123",
      username: "testuser",
      email: "test@example.com",
      imageUrl: "https://example.com/avatar.jpg",
    };

    it("should successfully get todos for a specific date ordered by created_at desc", async () => {
      const selectedDate = "2024-01-15";
      const mockTodos = [
        {
          id: "todo-1",
          user_id: "user-123",
          title: "Morning workout",
          completed: false,
          todo_date: "2024-01-15",
          created_at: "2024-01-15T10:00:00Z",
        },
        {
          id: "todo-2",
          user_id: "user-123",
          title: "Team meeting",
          completed: true,
          todo_date: "2024-01-15",
          created_at: "2024-01-15T08:00:00Z",
        },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: vi.fn().mockReturnThis(),
          order: () =>
            Promise.resolve({
              data: mockTodos,
              error: null,
            }),
        }),
      }));

      const result = await getTodosFromDay(selectedDate, mockUser);

      expect(mockSupabase.from).toHaveBeenCalledWith("todos");
      expect(result).toEqual(mockTodos);
    });

    it("should return empty array when no todos exist for the selected date", async () => {
      const selectedDate = "2024-01-20";

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: vi.fn().mockReturnThis(),
          order: () =>
            Promise.resolve({
              data: [],
              error: null,
            }),
        }),
      }));

      const result = await getTodosFromDay(selectedDate, mockUser);
      expect(result).toEqual([]);
    });

    it("should throw GET_TODOS_FROM_DAY_ERROR when database query fails", async () => {
      const selectedDate = "2024-01-15";

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: vi.fn().mockReturnThis(),
          order: () =>
            Promise.resolve({
              data: null,
              error: {
                code: "PGRST116",
                message: "Database error",
              },
            }),
        }),
      }));

      await expect(getTodosFromDay(selectedDate, mockUser)).rejects.toEqual({
        code: "GET_TODOS_FROM_DAY_ERROR",
      });
    });

    it("should filter todos by both user_id and todo_date", async () => {
      const selectedDate = "2024-01-15";
      const mockTodos = [
        {
          id: "todo-1",
          user_id: "user-123",
          title: "User specific todo",
          completed: false,
          todo_date: "2024-01-15",
          created_at: "2024-01-15T10:00:00Z",
        },
      ];

      const mockEq = vi.fn().mockReturnThis();
      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: mockEq,
          order: () =>
            Promise.resolve({
              data: mockTodos,
              error: null,
            }),
        }),
      }));

      await getTodosFromDay(selectedDate, mockUser);

      // Verify that eq was called twice - once for user_id and once for todo_date
      expect(mockEq).toHaveBeenCalledTimes(2);
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
      expect(mockEq).toHaveBeenCalledWith("todo_date", "2024-01-15");
    });

    it("should work with different user and date combinations", async () => {
      const differentUser = {
        accountId: "user-456",
        username: "anotheruser",
        email: "another@example.com",
        imageUrl: "https://example.com/avatar2.jpg",
      };
      const selectedDate = "2024-02-10";
      const mockTodos = [
        {
          id: "todo-3",
          user_id: "user-456",
          title: "Different user todo",
          completed: false,
          todo_date: "2024-02-10",
          created_at: "2024-02-10T14:30:00Z",
        },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: vi.fn().mockReturnThis(),
          order: () =>
            Promise.resolve({
              data: mockTodos,
              error: null,
            }),
        }),
      }));

      const result = await getTodosFromDay(selectedDate, differentUser);
      expect(result).toEqual(mockTodos);
    });
  });

  describe("getTodoById()", () => {
    const mockUser = {
      accountId: "user-123",
      username: "testuser",
      email: "test@example.com",
      imageUrl: "https://example.com/avatar.jpg",
    };

    it("should successfully get todo by id", async () => {
      const mockTodo = {
        id: "todo-1",
        user_id: "user-123",
        title: "Morning workout",
        completed: false,
        todo_date: "2024-01-15",
        created_at: "2024-01-15T10:00:00Z",
      };

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: vi.fn().mockReturnThis(),
          single: () => Promise.resolve({ data: mockTodo, error: null }),
        }),
      }));

      const result = await getTodoById("todo-1", mockUser);
      expect(result).toEqual(mockTodo);
    });

    it("should throw GET_TODO_BY_ID_ERROR when database query fails", async () => {
      const todoId = "todo-1";

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: vi.fn().mockReturnThis(),
          single: () =>
            Promise.resolve({
              data: null,
              error: {
                code: "PGRST116",
                message: "Database error",
              },
            }),
        }),
      }));

      await expect(getTodoById(todoId, mockUser)).rejects.toEqual({
        code: "GET_TODO_BY_ID_ERROR",
      });
    });
  });

  describe("searchTodos()", () => {
    const mockUser = {
      accountId: "user-123",
      username: "testuser",
      email: "test@example.com",
      imageUrl: "https://example.com/avatar.jpg",
    };

    it("should successfully search todos matching the search term", async () => {
      const searchTerm = "groceries";
      const mockTodos: TodoSearchResult[] = [
        {
          like: {
            id: "todo-1",
            user_id: "user-123",
            todo: "Buy groceries",
            is_completed: false,
            todo_date: "2024-01-15",
            created_at: "2024-01-15T10:00:00Z",
            from_delegated: null,
            image_url: null,
            is_independent_edit: null,
            original_todo_id: null,
            todo_more_content: null,
            updated_at: "2024-01-15T10:00:00Z",
          },
        },
        {
          like: {
            id: "todo-2",
            user_id: "user-123",
            todo: "Get groceries for dinner",
            is_completed: false,
            todo_date: "2024-01-15",
            created_at: "2024-01-15T09:00:00Z",
            from_delegated: null,
            image_url: null,
            is_independent_edit: null,
            original_todo_id: null,
            todo_more_content: null,
            updated_at: "2024-01-15T09:00:00Z",
          },
        },
      ];

      mockSupabase.rpc.mockResolvedValue({
        data: mockTodos,
        error: null,
      });

      const result = await searchTodos(searchTerm, mockUser);

      expect(mockSupabase.rpc).toHaveBeenCalledWith("search_todos", {
        search_term: searchTerm,
        user_id_param: mockUser.accountId,
      });

      expect(result).toEqual(mockTodos);

      result.forEach((todo) => {
        expect(todo.like.todo.toLowerCase()).toContain(
          searchTerm.toLowerCase()
        );
      });
    });

    it("should throw SEARCH_TODOS_ERROR when search fails", async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { code: "RPC_ERROR", message: "Search failed" },
      });

      await expect(searchTodos("test", mockUser)).rejects.toEqual({
        code: "SEARCH_TODOS_ERROR",
      });
    });
  });

  describe("uploadImageAndGetUrl()", () => {
    const mockAccountId = "user-123";
    const mockTodoId = "todo-456";
    const mockImage = new File(["mock content"], "test-image.jpg", {
      type: "image/jpeg",
    });

    it("should successfully upload image and return public URL", async () => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);

      const expectedFilePath = `${mockAccountId}/${mockTodoId}_1234567890.jpg`;
      const expectedPublicUrl = `https://supabase.storage.url/${expectedFilePath}`;

      const mockStorageChain = {
        upload: vi.fn().mockResolvedValue({
          data: { path: expectedFilePath },
          error: null,
        }),
        list: vi.fn(() => ({ data: [], error: null })),
        getPublicUrl: vi.fn(() => ({
          data: { publicUrl: expectedPublicUrl },
        })),
      };

      mockSupabase.storage.from.mockReturnValue(mockStorageChain);

      const result = await uploadImageAndGetUrl(
        mockAccountId,
        mockTodoId,
        mockImage
      );

      expect(mockSupabase.storage.from).toHaveBeenCalledWith("todo-images");
      expect(mockStorageChain.upload).toHaveBeenCalledWith(
        expectedFilePath,
        mockImage,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );
      expect(mockStorageChain.getPublicUrl).toHaveBeenCalledWith(
        expectedFilePath
      );
      expect(result).toBe(expectedPublicUrl);
    });

    it("should throw UPLOAD_IMAGE_ERROR when upload fails", async () => {
      vi.spyOn(Date, "now").mockReturnValue(1234567890);

      const uploadError = {
        message: "Storage quota exceeded",
        statusCode: "413",
      };

      mockSupabase.storage.from.mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
        upload: vi.fn().mockResolvedValue({
          data: null,
          error: uploadError,
        }),
        getPublicUrl: vi.fn(),
      });

      await expect(
        uploadImageAndGetUrl(mockAccountId, mockTodoId, mockImage)
      ).rejects.toEqual({
        code: "UPLOAD_IMAGE_ERROR",
      });

      const uploadMock = mockSupabase.storage.from().upload;
      expect(uploadMock).toHaveBeenCalledWith(
        `${mockAccountId}/${mockTodoId}_1234567890.jpg`,
        mockImage,
        {
          cacheControl: "3600",
          upsert: false,
        }
      );

      const getPublicUrlMock = mockSupabase.storage.from().getPublicUrl;
      expect(getPublicUrlMock).not.toHaveBeenCalled();
    });
  });

  describe("countImageReferences()", () => {
    const mockAccountId = "user-123";
    const mockTodoId = "todo-456";
    it("should successfully count image references", async () => {
      const mockImageUrl = "https://example.com/image.jpg";
      const mockTodos = [
        { id: "todo-1", image_url: mockImageUrl },
        { id: "todo-2", image_url: mockImageUrl },
      ];

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () =>
              Promise.resolve({
                data: mockTodos,
                error: null,
              }),
          }),
        }),
      }));

      const result = await countImageReferences(
        mockAccountId,
        mockImageUrl,
        mockTodoId
      );

      expect(result).toBe(2);
    });

    it("should return 0 when no image references are found", async () => {
      const mockImageUrl = "https://example.com/image.jpg";

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () =>
              Promise.resolve({
                data: [],
                error: null,
              }),
          }),
        }),
      }));

      const result = await countImageReferences(
        mockAccountId,
        mockImageUrl,
        mockTodoId
      );
      expect(result).toBe(0);
    });

    it("should return 0 when database error occurs", async () => {
      const mockImageUrl = "https://example.com/image.jpg";

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () =>
              Promise.resolve({
                data: null,
                error: {
                  message: "Database error",
                },
              }),
          }),
        }),
      }));
      const result = await countImageReferences(
        mockAccountId,
        mockImageUrl,
        mockTodoId
      );
      expect(result).toBe(0);
    });
  });

  describe("isLastImageReference()", () => {
    const mockAccountId = "user-123";
    const excludingTodoId = "todo-456";

    it("should return true when image is referenced only once", async () => {
      const mockImageUrl = "https://example.com/image.jpg";

      mockSupabase.from.mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            eq: () =>
              Promise.resolve({
                data: [{ id: excludingTodoId, image_url: mockImageUrl }],
                error: null,
              }),
          }),
        }),
      }));

      const result = await isLastImageReference(
        mockAccountId,
        mockImageUrl,
        excludingTodoId
      );

      expect(result).toBe(true);
    });
  });

  describe("getFilePathFromUrl()", () => {
    it("should successfully get file path from url", () => {
      const mockImageUrl =
        "https://todo-images.supabase.co/todo-images/user-123/todo-456_1234567890.jpg";
      const expectedFilePath = "user-123/todo-456_1234567890.jpg";
      const result = getFilePathFromUrl(mockImageUrl);
      expect(result).toBe(expectedFilePath);
    });
    it("should return null when url is invalid", () => {
      const mockImageUrl = "https://example.com/image.jpg";
      const result = getFilePathFromUrl(mockImageUrl);
      expect(result).toBe(null);
    });
  });
  describe("updateTodoCompletionStatus()", () => {
    const mockUser = {
      accountId: "user-123",
      username: "testuser",
      email: "test@example.com",
      imageUrl: "https://example.com/avatar.jpg",
    };
    it("should successfully update todo completion status", async () => {
      const mockTodoId = "todo-1";
      const mockSelectedDate = "2024-01-15";
      const mockIsCompleted = true;

      const mockEq3 = vi.fn().mockResolvedValue({ data: null, error: null });
      const mockEq2 = vi.fn(() => ({ eq: mockEq3 }));
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
      const mockUpdate = vi.fn(() => ({ eq: mockEq1 }));

      mockSupabase.from.mockReturnValue({ update: mockUpdate });

      await updateTodoCompletionStatus(
        mockTodoId,
        mockSelectedDate,
        mockUser,
        mockIsCompleted
      );

      expect(mockSupabase.from).toHaveBeenCalledWith("todos");
      expect(mockUpdate).toHaveBeenCalledWith({
        is_completed: mockIsCompleted,
      });
      expect(mockEq1).toHaveBeenCalledWith("id", mockTodoId);
      expect(mockEq2).toHaveBeenCalledWith("user_id", mockUser.accountId);
      expect(mockEq3).toHaveBeenCalledWith("todo_date", mockSelectedDate);
    });

    it("should throw error when update fails", async () => {
      const mockError = { code: "ERROR", message: "Update failed" };

      mockSupabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            eq: () => ({
              eq: () => Promise.resolve({ data: null, error: mockError }),
            }),
          }),
        }),
      }));

      await expect(
        updateTodoCompletionStatus("todo-1", "2024-01-15", mockUser, true)
      ).rejects.toEqual({
        code: "UPDATE_TODO_COMPLETION_STATUS_ERROR",
      });
    });
  });
});
