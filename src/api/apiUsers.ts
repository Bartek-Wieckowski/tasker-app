import { supabase } from "@/lib/supabaseClient";
import { UpdateUser, UpdateUserPassword } from "@/types/types";
import { STARTER_USER_AVATAR_URL } from "@/lib/constants";

export async function registerUser(
  email: string,
  password: string,
  username: string
) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
        avatar_url: STARTER_USER_AVATAR_URL,
        display_name: username,
      },
    },
  });

  if (signUpError) {
    if (import.meta.env.DEV) {
      console.error({
        code: signUpError.code,
        status: signUpError.status,
        message: signUpError.message,
      });
    }
    throw { code: "REGISTER_ERROR" };
  }

  const user = signUpData.user;

  if (!user || !user.id || !user.email) {
    throw { code: "INVALID_USER_DATA" };
  }

  const { error: syncError } = await supabase.functions.invoke("sync_user", {
    body: {
      id: user.id,
      email: user.email,
    },
  });

  if (syncError) {
    if (import.meta.env.DEV) {
      console.error({
        code: syncError.code,
        status: syncError.status,
        message: syncError.message,
      });
    }
    throw { code: "REGISTER_ERROR" };
  }

  return user;
}

export async function getAuthenticatedUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function deleteAccount() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  const { error } = await supabase.functions.invoke("delete_user", {
    body: { user_id: user.id },
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        status: error.status,
        message: error.message,
      });
    }
    throw { code: "DELETE_USER_ERROR" };
  }

  await supabase.auth.signOut();
}

export async function loginAccount(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        status: error.status,
        message: error.message,
      });
    }
    throw { code: "LOGIN_ERROR" };
  }

  return data;
}

export async function logoutAccount() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        status: error.status,
        message: error.message,
      });
    }
    throw { code: "LOGOUT_ERROR" };
  }
}

export async function loginAccountWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        status: error.status,
        message: error.message,
      });
    }
    throw { code: "LOGIN_WITH_GOOGLE_ERROR" };
  }

  return data;
}

export async function getUserCustomAvatar(userId: string) {
  const { data: files, error: listError } = await supabase.storage
    .from("user-avatars")
    .list(userId);

  if (listError || !files || files.length === 0) {
    return null;
  }

  const avatarFile = files.find((file) => file.name.startsWith("avatar."));

  if (!avatarFile) {
    return null;
  }

  const {
    data: { publicUrl },
  } = supabase.storage
    .from("user-avatars")
    .getPublicUrl(`${userId}/${avatarFile.name}`);

  return publicUrl;
}

async function getCurrentUserAvatar(userId: string, currentAvatarUrl?: string) {
  const customAvatar = await getUserCustomAvatar(userId);
  if (customAvatar) {
    return customAvatar;
  }

  if (currentAvatarUrl) {
    return currentAvatarUrl;
  }

  return STARTER_USER_AVATAR_URL;
}

export async function uploadUserImage(userId: string, imageFile: File) {
  const fileExt = imageFile.name.split(".").pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { error } = await supabase.storage
    .from("user-avatars")
    .upload(fileName, imageFile, {
      upsert: true,
    });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        message: error.message,
      });
    }
    throw { code: "IMAGE_UPLOAD_ERROR" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("user-avatars").getPublicUrl(fileName);

  return publicUrl;
}

export async function deleteUserImage(userId: string) {
  const { data: files, error: listError } = await supabase.storage
    .from("user-avatars")
    .list(userId);

  if (listError) {
    if (import.meta.env.DEV) {
      console.error({
        message: listError.message,
      });
    }
    throw { code: "IMAGE_DELETE_ERROR" };
  }

  if (files && files.length > 0) {
    const filePaths = files.map((file) => `${userId}/${file.name}`);

    const { error: deleteError } = await supabase.storage
      .from("user-avatars")
      .remove(filePaths);

    if (deleteError) {
      if (import.meta.env.DEV) {
        console.error({
          code: deleteError.message,
          message: "Failed to delete images",
        });
      }
      throw { code: "IMAGE_DELETE_ERROR" };
    }
  }
}

export async function updateUsername(newUsername: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  const currentAvatarUrl = user.user_metadata.avatar_url || "";
  const newAvatarUrl = await getCurrentUserAvatar(user.id, currentAvatarUrl);

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      username: newUsername,
      display_name: newUsername,
      avatar_url: newAvatarUrl,
    },
  });

  if (authError) {
    if (import.meta.env.DEV) {
      console.error({
        code: authError.code,
        message: authError.message,
      });
    }
    throw { code: "UPDATE_USERNAME_ERROR" };
  }
}

export async function updateUserEmail(newEmail: string) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  const { error: authError } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (authError) {
    if (import.meta.env.DEV) {
      console.error({
        code: authError.code,
        message: authError.message,
      });
    }
    throw { code: "UPDATE_EMAIL_ERROR" };
  }

  const { error: dbError } = await supabase
    .from("db_users")
    .update({
      email: newEmail,
    })
    .eq("id", user.id)
    .eq("is_active", true);

  if (dbError) {
    if (import.meta.env.DEV) {
      console.error({
        code: dbError.code,
        message: dbError.message,
      });
    }
    throw { code: "UPDATE_EMAIL_DB_ERROR" };
  }
}

export async function updateUserAvatar(imageFile: File) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  await deleteUserImage(user.id);

  const newAvatarUrl = await uploadUserImage(user.id, imageFile);

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: newAvatarUrl },
  });

  if (authError) {
    if (import.meta.env.DEV) {
      console.error({
        code: authError.code,
        message: authError.message,
      });
    }
    throw { code: "UPDATE_AVATAR_ERROR" };
  }

  return newAvatarUrl;
}

export async function deleteUserAvatar() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  await deleteUserImage(user.id);

  const defaultAvatarUrl = STARTER_USER_AVATAR_URL;

  const { error: authError } = await supabase.auth.updateUser({
    data: { avatar_url: defaultAvatarUrl },
  });

  if (authError) {
    if (import.meta.env.DEV) {
      console.error({
        code: authError.code,
        message: authError.message,
      });
    }
    throw { code: "DELETE_AVATAR_ERROR" };
  }
}

export async function updateUserSettings(updateData: UpdateUser) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  const currentEmail = user.email;
  const currentUsername = user.user_metadata.username;
  const currentAvatarUrl = user.user_metadata.avatar_url || "";

  const isEmailChanging = updateData.email !== currentEmail;
  const isUsernameChanging = updateData.username !== currentUsername;
  const isImageChanging = !!updateData.imageUrl;

  if (!isEmailChanging && !isUsernameChanging && !isImageChanging) {
    return {
      accountId: user.id,
      username: currentUsername,
      email: currentEmail,
      imageUrl: currentAvatarUrl,
    };
  }

  let newAvatarUrl = currentAvatarUrl;

  if (isImageChanging) {
    newAvatarUrl = await updateUserAvatar(updateData.imageUrl!);
  } else {
    newAvatarUrl = await getCurrentUserAvatar(user.id, currentAvatarUrl);
  }

  const authUpdates: {
    email?: string;
    data?: {
      username?: string;
      avatar_url?: string;
      display_name?: string;
    };
  } = {};

  if (isEmailChanging) {
    authUpdates.email = updateData.email;
  }

  if (isUsernameChanging || isImageChanging) {
    authUpdates.data = {};

    if (isUsernameChanging) {
      authUpdates.data.username = updateData.username;
      authUpdates.data.display_name = updateData.username;
    }

    authUpdates.data.avatar_url = newAvatarUrl;
  }

  if (Object.keys(authUpdates).length > 0) {
    const { error: authError } = await supabase.auth.updateUser(authUpdates);

    if (authError) {
      if (import.meta.env.DEV) {
        console.error({
          code: authError.code,
          message: authError.message,
        });
      }
      throw { code: "UPDATE_AUTH_ERROR" };
    }
  }

  if (isEmailChanging) {
    const { error: dbError } = await supabase
      .from("db_users")
      .update({
        email: updateData.email,
      })
      .eq("id", user.id)
      .eq("is_active", true);

    if (dbError) {
      if (import.meta.env.DEV) {
        console.error({
          code: dbError.code,
          message: dbError.message,
        });
      }
      throw { code: "UPDATE_USER_DB_ERROR" };
    }
  }

  return {
    accountId: user.id,
    username: updateData.username,
    email: updateData.email,
    imageUrl: newAvatarUrl,
  };
}

export async function updateUserPassword(passwordData: UpdateUserPassword) {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  const currentAvatarUrl = user.user_metadata.avatar_url || "";
  const newAvatarUrl = await getCurrentUserAvatar(user.id, currentAvatarUrl);

  const { error } = await supabase.auth.updateUser({
    password: passwordData.password,
    data: {
      avatar_url: newAvatarUrl,
    },
  });

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "UPDATE_PASSWORD_ERROR" };
  }
}

export async function updateUserLanguage(language: "en" | "pl") {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw { code: "NO_USER_FOUND" };
  }

  const { error } = await supabase
    .from("db_users")
    .update({ lang: language })
    .eq("id", user.id)
    .eq("is_active", true);

  if (error) {
    if (import.meta.env.DEV) {
      console.error({
        code: error.code,
        message: error.message,
      });
    }
    throw { code: "UPDATE_LANGUAGE_ERROR" };
  }
}
