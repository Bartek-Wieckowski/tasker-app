import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  serve: (handler: (req: Request) => Promise<Response>) => void;
  env: {
    get: (key: string) => string;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(
        JSON.stringify({
          error: "Missing user_id",
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    try {
      // Get user email before deletion for cleanup
      const { data: userData, error: userError } = await supabase
        .from("db_users")
        .select("email")
        .eq("id", user_id)
        .single();

      if (userError || !userData?.email) {
        console.warn("Failed to get user email for cleanup:", userError);
      }

      const userEmail = userData?.email;

      // Clean up user avatars
      const { data: avatarFiles, error: avatarListError } =
        await supabase.storage.from("user-avatars").list(user_id);

      if (!avatarListError && avatarFiles && avatarFiles.length > 0) {
        const avatarPaths = avatarFiles.map(
          (file) => `${user_id}/${file.name}`
        );
        const { error: avatarDeleteError } = await supabase.storage
          .from("user-avatars")
          .remove(avatarPaths);

        if (avatarDeleteError) {
          console.warn("Failed to clean up user avatars:", avatarDeleteError);
        }
      }

      // Clean up todo images
      const { data: todoFiles, error: todoListError } = await supabase.storage
        .from("todo-images")
        .list(user_id);

      if (!todoListError && todoFiles && todoFiles.length > 0) {
        const todoPaths = todoFiles.map((file) => `${user_id}/${file.name}`);
        const { error: todoDeleteError } = await supabase.storage
          .from("todo-images")
          .remove(todoPaths);

        if (todoDeleteError) {
          console.warn("Failed to clean up todo images:", todoDeleteError);
        }
      }

      // Delete all todos for the user
      const { error: todosError } = await supabase
        .from("todos")
        .delete()
        .eq("user_id", user_id);

      if (todosError) {
        console.warn("Failed to delete user todos:", todosError);
      }

      // Delete all delegated todos for the user
      const { error: delegatedTodosError } = await supabase
        .from("delegated_todos")
        .delete()
        .eq("user_id", user_id);

      if (delegatedTodosError) {
        console.warn(
          "Failed to delete user delegated todos:",
          delegatedTodosError
        );
      }

      // Delete all global todos for the user
      const { error: globalTodosError } = await supabase
        .from("global_todos")
        .delete()
        .eq("user_id", user_id);

      if (globalTodosError) {
        console.warn("Failed to delete user global todos:", globalTodosError);
      }

      // Delete user from cyclic todos
      const { error: deleteCyclicTodosError } = await supabase
        .from("cyclic_todos")
        .delete()
        .eq("user_id", user_id);

      if (deleteCyclicTodosError) {
        console.warn(
          "Failed to delete user cyclic todos:",
          deleteCyclicTodosError
        );
      }

      // Remove user email from shared todos member_emails arrays
      if (userEmail) {
        const { error: removeFromSharedError } = await supabase.rpc(
          "remove_user_from_shared_todos",
          {
            user_email_to_remove: userEmail,
          }
        );

        if (removeFromSharedError) {
          console.warn(
            "Failed to remove user from shared todos:",
            removeFromSharedError
          );
        }
      }

      // Deactivate user in database
      const { error: deactivateError } = await supabase.rpc("deactivate_user", {
        p_user_id: user_id,
      });
      if (deactivateError) {
        throw new Error(
          `Database deactivation failed: ${deactivateError.message}`
        );
      }

      // Delete user from auth
      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user_id
      );
      if (deleteError) {
        throw new Error(`Auth deletion failed: ${deleteError.message}`);
      }
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error.message || "Unexpected error during user deletion",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: "Unexpected error",
        details: err.message,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
