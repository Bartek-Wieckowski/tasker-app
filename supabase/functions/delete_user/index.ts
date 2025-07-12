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

    let userFilePaths: string[] = [];

    try {
      const { data: files, error: listError } = await supabase.storage
        .from("user-avatars")
        .list(user_id);

      if (!listError && files && files.length > 0) {
        userFilePaths = files.map((file) => `${user_id}/${file.name}`);
      }

      const { error: deleteError } = await supabase.auth.admin.deleteUser(
        user_id
      );
      if (deleteError) {
        throw new Error(`Auth deletion failed: ${deleteError.message}`);
      }

      const { error: rpcError } = await supabase.rpc("deactivate_user", {
        p_user_id: user_id,
      });
      if (rpcError) {
        throw new Error(`Database deactivation failed: ${rpcError.message}`);
      }

      if (userFilePaths.length > 0) {
        const { error: storageError } = await supabase.storage
          .from("user-avatars")
          .remove(userFilePaths);

        if (storageError) {
          console.warn(
            "Failed to clean up user images after successful user deletion:",
            storageError
          );
        }
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
