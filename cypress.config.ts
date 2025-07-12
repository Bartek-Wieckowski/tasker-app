import { createClient } from "@supabase/supabase-js";
import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    setupNodeEvents(on) {
      // Register the db:reset task
      on("task", {
        "db:reset": async () => {
          try {
            console.log("Starting test data cleanup...");

            // Create Supabase client with service role key for admin operations
            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            const { data: usersList, error: listError } =
              await supabase.auth.admin.listUsers();

            if (listError) {
              console.error("❌ Error listing users:", listError);
              return null;
            }
            const testUsers = usersList.users.filter((user) =>
              user.email?.startsWith("taskertestuser")
            );

            for (const user of testUsers) {
              const { error: deleteError } =
                await supabase.auth.admin.deleteUser(user.id);
              if (deleteError) {
                console.error(
                  `❌ Failed to delete user ${user.email}:`,
                  deleteError
                );
              } else {
                console.log(`✅ Deleted test user: ${user.email}`);
              }
            }

            // Use the clean_test_users function to clean both auth.users and db_users
            const { error: cleanupError } = await supabase.rpc(
              "clean_test_users"
            );

            if (cleanupError) {
              console.error("Error cleaning test users:", cleanupError);
            } else {
              console.log(
                "Test data cleanup completed successfully using clean_test_users function"
              );
            }

            console.log("=== DB RESET TASK COMPLETED SUCCESSFULLY ===");
            return null;
          } catch (error) {
            console.error("=== DB RESET TASK FAILED ===", error);
            // Don't fail the test, just log the error
            return null;
          }
        },
      });
    },
    env: {
      SUPABASE_URL: "http://127.0.0.1:54321",
      SUPABASE_ANON_KEY:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
