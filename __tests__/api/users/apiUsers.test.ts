import { describe, it, expect, vi } from "vitest";
import {
  registerUser,
  getAuthenticatedUser,
  deleteAccount,
  loginAccount,
  logoutAccount,
  loginAccountWithGoogle,
  updateUserSettings,
  updateUserPassword,
} from "@/api/apiUsers";

import { mockSupabase } from "../../setup";

describe("apiUsers", () => {
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

  describe("getAuthenticatedUser()", () => {
    it("should return authenticated user", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await getAuthenticatedUser();

      expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it("should return null when no user is authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const result = await getAuthenticatedUser();

      expect(result).toBeNull();
    });
  });

  describe("deleteAccount()", () => {
    it("should successfully delete account", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: null,
      });

      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      await deleteAccount();

      expect(mockSupabase.functions.invoke).toHaveBeenCalledWith(
        "delete_user",
        {
          body: { user_id: "user-123" },
        }
      );
      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should throw NO_USER_FOUND when no user is authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(deleteAccount()).rejects.toEqual({ code: "NO_USER_FOUND" });
    });

    it("should throw DELETE_USER_ERROR when delete function fails", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.functions.invoke.mockResolvedValue({
        data: null,
        error: { code: "function_error", message: "Delete failed" },
      });

      await expect(deleteAccount()).rejects.toEqual({
        code: "DELETE_USER_ERROR",
      });
    });
  });

  describe("loginAccount()", () => {
    it("should successfully login with email and password", async () => {
      const mockAuthData = {
        user: { id: "user-123", email: "test@example.com" },
        session: { access_token: "token-123" },
      };

      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: mockAuthData,
        error: null,
      });

      const result = await loginAccount("test@example.com", "password123");

      expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(result).toEqual(mockAuthData);
    });

    it("should throw LOGIN_ERROR when login fails", async () => {
      mockSupabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { code: "invalid_credentials", message: "Invalid credentials" },
      });

      await expect(
        loginAccount("test@example.com", "wrongpassword")
      ).rejects.toEqual({ code: "LOGIN_ERROR" });
    });
  });

  describe("logoutAccount()", () => {
    it("should successfully logout", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: null,
      });

      await logoutAccount();

      expect(mockSupabase.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it("should throw LOGOUT_ERROR when logout fails", async () => {
      mockSupabase.auth.signOut.mockResolvedValue({
        error: { code: "logout_error", message: "Logout failed" },
      });

      await expect(logoutAccount()).rejects.toEqual({ code: "LOGOUT_ERROR" });
    });
  });

  describe("loginAccountWithGoogle()", () => {
    it("should successfully initiate Google OAuth", async () => {
      const mockOAuthData = {
        provider: "google",
        url: "https://oauth.url",
      };

      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: mockOAuthData,
        error: null,
      });

      const result = await loginAccountWithGoogle();

      expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            prompt: "select_account",
          },
        },
      });
      expect(result).toEqual(mockOAuthData);
    });

    it("should throw LOGIN_WITH_GOOGLE_ERROR when OAuth fails", async () => {
      mockSupabase.auth.signInWithOAuth.mockResolvedValue({
        data: { provider: null, url: null },
        error: { code: "oauth_error", message: "OAuth failed" },
      });

      await expect(loginAccountWithGoogle()).rejects.toEqual({
        code: "LOGIN_WITH_GOOGLE_ERROR",
      });
    });
  });

  describe("updateUserSettings()", () => {
    it("should successfully update user settings with email change", async () => {
      const mockUser = {
        id: "user-123",
        email: "old@example.com",
        user_metadata: { username: "oldusername" },
      };

      const updateData = {
        username: "newusername",
        email: "new@example.com",
        imageUrl: undefined,
      };

      const mockUpdatedData = {
        accountId: "user-123",
        email: "new@example.com",
        username: "newusername",
        imageUrl:
          "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: mockUpdatedData,
                    error: null,
                  }),
              }),
            }),
          }),
        }),
      }));

      mockSupabase.storage.from.mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
        upload: vi.fn().mockResolvedValue({
          data: { path: "mock-path" },
          error: null,
        }),
        getPublicUrl: vi.fn(() => ({
          data: {
            publicUrl:
              "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
          },
        })),
      });

      const result = await updateUserSettings(updateData);

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        email: "new@example.com",
        data: {
          username: "newusername",
          display_name: "newusername",
          avatar_url:
            "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
        },
      });

      expect(mockSupabase.from).toHaveBeenCalledWith("db_users");
      expect(result).toEqual(mockUpdatedData);
    });

    it("should update only username when email stays the same", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: { username: "oldusername" },
      };

      const updateData = {
        username: "newusername",
        email: "test@example.com",
        imageUrl: undefined,
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            eq: () => ({
              select: () => ({
                single: () =>
                  Promise.resolve({
                    data: {},
                    error: null,
                  }),
              }),
            }),
          }),
        }),
      }));

      mockSupabase.storage.from.mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
        upload: vi.fn().mockResolvedValue({
          data: { path: "mock-path" },
          error: null,
        }),
        getPublicUrl: vi.fn(() => ({
          data: {
            publicUrl:
              "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
          },
        })),
      });

      await updateUserSettings(updateData);

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          username: "newusername",
          display_name: "newusername",
          avatar_url:
            "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
        },
      });
    });

    it("should throw NO_USER_FOUND when no user is authenticated", async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(
        updateUserSettings({
          username: "test",
          email: "test@example.com",
          imageUrl: undefined,
        })
      ).rejects.toEqual({ code: "NO_USER_FOUND" });
    });

    it("should throw UPDATE_AUTH_ERROR when auth update fails", async () => {
      const mockUser = {
        id: "user-123",
        email: "old@example.com",
        user_metadata: { username: "oldusername" },
      };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { code: "invalid_email", message: "Invalid email" },
      });

      await expect(
        updateUserSettings({
          username: "newusername",
          email: "invalid-email",
          imageUrl: undefined,
        })
      ).rejects.toEqual({ code: "UPDATE_AUTH_ERROR" });
    });
  });

  describe("updateUserPassword()", () => {
    it("should successfully update user password", async () => {
      const mockUser = {
        id: "user-123",
        email: "test@example.com",
        user_metadata: {
          avatar_url:
            "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
        },
      };

      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockImplementation(() => ({
        update: () => ({
          eq: () => ({
            eq: () =>
              Promise.resolve({
                data: null,
                error: null,
              }),
          }),
        }),
      }));

      mockSupabase.storage.from.mockReturnValue({
        list: vi.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
        upload: vi.fn().mockResolvedValue({
          data: { path: "mock-path" },
          error: null,
        }),
        getPublicUrl: vi.fn(() => ({
          data: {
            publicUrl:
              "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
          },
        })),
      });

      await updateUserPassword({ password: "newpassword123" });

      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        password: "newpassword123",
        data: {
          avatar_url:
            "https://i.pinimg.com/280x280_RS/77/0f/b7/770fb75f5e81e4c2dbe8934f246aeeab.jpg",
        },
      });
    });

    it("should throw UPDATE_PASSWORD_ERROR when password update fails", async () => {
      mockSupabase.auth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { code: "weak_password", message: "Password too weak" },
      });

      await expect(updateUserPassword({ password: "123" })).rejects.toEqual({
        code: "UPDATE_PASSWORD_ERROR",
      });
    });
  });
});
