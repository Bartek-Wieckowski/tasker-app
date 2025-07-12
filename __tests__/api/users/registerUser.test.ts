import { describe, it, expect } from "vitest";
import { registerUser } from "@/api/apiUsers";
import { mockSupabase } from "../../setup";

describe("registerUser()", () => {
  it("should successfully register a user", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: null,
    });

    const result = await registerUser(
      "test@example.com",
      "password123",
      "testuser"
    );

    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "password123",
      options: {
        data: {
          username: "testuser",
          avatar_url:
            "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
          display_name: "testuser",
        },
      },
    });

    expect(mockSupabase.functions.invoke).toHaveBeenCalledWith("sync_user", {
      body: {
        id: "user-123",
        email: "test@example.com",
      },
    });

    expect(result).toEqual(mockUser);
  });

  it("should throw REGISTER_ERROR when signUp fails", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: null },
      error: { code: "signup_disabled", message: "Signup is disabled" },
    });

    await expect(
      registerUser("test@example.com", "password123", "testuser")
    ).rejects.toEqual({ code: "REGISTER_ERROR" });
  });

  it("should throw INVALID_USER_DATA when user data is incomplete", async () => {
    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: { id: null, email: "test@example.com" } },
      error: null,
    });

    await expect(
      registerUser("test@example.com", "password123", "testuser")
    ).rejects.toEqual({ code: "INVALID_USER_DATA" });
  });

  it("should throw REGISTER_ERROR when sync_user function fails", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
    };

    mockSupabase.auth.signUp.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    mockSupabase.functions.invoke.mockResolvedValue({
      data: null,
      error: { code: "function_error", message: "Function failed" },
    });

    await expect(
      registerUser("test@example.com", "password123", "testuser")
    ).rejects.toEqual({ code: "REGISTER_ERROR" });
  });
});
