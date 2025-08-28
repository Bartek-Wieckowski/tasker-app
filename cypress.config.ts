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
            // 3. Empty bucket with images in subfolders
            const bucketName = "todo-images";

            // list main folder → there are subfolders (UUID)
            const { data: folders, error: listFoldersError } =
              await supabase.storage.from(bucketName).list("", { limit: 1000 });

            if (listFoldersError) {
              console.error("❌ Error listing folders:", listFoldersError);
            } else if (folders && folders.length > 0) {
              const allFilePaths: string[] = [];

              for (const folder of folders) {
                if (folder.name) {
                  // list files in folder (e.g. "uuid-user-1")
                  const { data: files, error: listFilesError } =
                    await supabase.storage
                      .from(bucketName)
                      .list(folder.name, { limit: 1000 });

                  if (listFilesError) {
                    console.error(
                      `❌ Error listing files in folder ${folder.name}:`,
                      listFilesError
                    );
                    continue;
                  }

                  if (files && files.length > 0) {
                    // you need to provide full path: "uuid-user-1/file.png"
                    const filePaths = files.map(
                      (f) => `${folder.name}/${f.name}`
                    );
                    allFilePaths.push(...filePaths);
                  }
                }
              }

              if (allFilePaths.length > 0) {
                const { error: removeError } = await supabase.storage
                  .from(bucketName)
                  .remove(allFilePaths);
                if (removeError) {
                  console.error(
                    "❌ Error deleting files from bucket:",
                    removeError
                  );
                } else {
                  console.log(
                    `✅ Deleted ${allFilePaths.length} files from bucket "${bucketName}"`
                  );
                }
              } else {
                console.log(`ℹ️ No files to delete in bucket "${bucketName}"`);
              }
            } else {
              console.log(`ℹ️ No folders found in bucket "${bucketName}"`);
            }

            console.log("=== DB RESET TASK COMPLETED SUCCESSFULLY ===");
            return null;
          } catch (error) {
            console.error("=== DB RESET TASK FAILED ===", error);
            // Don't fail the test, just log the error
            return null;
          }
        },
        supabaseInsert: async ({ table, values }) => {
          try {
            console.log(`Inserting into ${table}:`, values);

            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            const { data, error } = await supabase
              .from(table)
              .insert(values)
              .select()
              .single();

            if (error) {
              console.error(`❌ Error inserting into ${table}:`, error);
              return null;
            }

            console.log(`✅ Successfully inserted into ${table}:`, data);
            return data;
          } catch (error) {
            console.error(
              `=== SUPABASE INSERT TASK FAILED for ${table} ===`,
              error
            );
            return null;
          }
        },
        cleanupTodos: async () => {
          try {
            // console.log("Cleaning todos data only...");

            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            // Clean all todo-related tables but keep users
            const tables = [
              "todos",
              "cyclic_todos",
              "delegated_todos",
              "global_todos",
              "coop_todos",
            ];

            for (const table of tables) {
              console.log(`Cleaning table: ${table}`);

              // First check what's in the table
              const { data: beforeData } = await supabase
                .from(table)
                .select("id");

              console.log(
                `${table} has ${beforeData?.length || 0} rows before cleanup`
              );

              // Delete all rows - use gt filter which should work for all rows
              const { error } = await supabase
                .from(table)
                .delete()
                .gt("created_at", "1900-01-01");

              if (error) {
                console.log(`❌ Error cleaning ${table}:`, error);
                throw error;
              } else {
                // Verify deletion worked
                const { data: afterData } = await supabase
                  .from(table)
                  .select("id");
                console.log(
                  `✅ Cleaned table: ${table}, ${
                    afterData?.length || 0
                  } rows remaining`
                );
              }
            }

            // Clean todo images from storage
            const bucketName = "todo-images";
            const { data: folders, error: listFoldersError } =
              await supabase.storage.from(bucketName).list("", { limit: 1000 });

            if (!listFoldersError && folders && folders.length > 0) {
              const allFilePaths: string[] = [];

              for (const folder of folders) {
                if (folder.name) {
                  const { data: files, error: listFilesError } =
                    await supabase.storage
                      .from(bucketName)
                      .list(folder.name, { limit: 1000 });

                  if (!listFilesError && files && files.length > 0) {
                    const filePaths = files.map(
                      (f) => `${folder.name}/${f.name}`
                    );
                    allFilePaths.push(...filePaths);
                  }
                }
              }

              if (allFilePaths.length > 0) {
                const { error: removeError } = await supabase.storage
                  .from(bucketName)
                  .remove(allFilePaths);
                if (!removeError) {
                  // console.log(`✅ Cleaned ${allFilePaths.length} todo images`);
                }
              }
            }

            // console.log("✅ Todos cleanup completed successfully");
            return null;
          } catch (error) {
            // console.log("❌ Todos cleanup failed:", error);
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
