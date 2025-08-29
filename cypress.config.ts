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
              "coop_todos_shared",
              "coop_invitations",
            ];

            for (const table of tables) {
              // console.log(`Cleaning table: ${table}`);

              // First check what's in the table
              const { data: beforeData } = await supabase
                .from(table)
                .select("id");

              // console.log(
              //   `${table} has ${beforeData?.length || 0} rows before cleanup`
              // );

              // Delete all rows - use gt filter which should work for all rows
              const { error } = await supabase
                .from(table)
                .delete()
                .gt("created_at", "1900-01-01");

              if (error) {
                // console.log(`❌ Error cleaning ${table}:`, error);
                throw error;
              } else {
                // Verify deletion worked
                const { data: afterData } = await supabase
                  .from(table)
                  .select("id");
                // console.log(
                //   `✅ Cleaned table: ${table}, ${
                //     afterData?.length || 0
                //   } rows remaining`
                // );
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
        checkDbUsers: async () => {
          try {
            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            const { data: users, error } = await supabase
              .from("db_users")
              .select("*");

            if (error) {
              // console.error("Error checking db_users:", error);
              return null;
            }

            // console.log("Current db_users:", users);
            return users;
          } catch (error) {
            // console.error("Check db_users failed:", error);
            return null;
          }
        },
        createSharedTable: async ({
          tableName,
          description,
          ownerUserId,
          ownerEmail,
          memberEmails = [],
        }) => {
          try {
            // console.log("🔧 Creating shared table with:", {
            //   tableName,
            //   description,
            //   ownerUserId,
            //   ownerEmail,
            //   memberEmails,
            // });

            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            const insertData = {
              table_name: tableName,
              description: description,
              owner_user_id: ownerUserId,
              member_emails: [ownerEmail, ...memberEmails],
            };

            // console.log("📝 Inserting data:", insertData);

            const { data, error } = await supabase
              .from("coop_todos_shared")
              .insert(insertData)
              .select()
              .single();

            if (error) {
              // console.error("❌ Error creating shared table:", error);
              // console.error(
              //   "Error details:",
              //   error.message,
              //   error.details,
              //   error.hint
              // );
              return null;
            }

            // console.log("✅ Created shared table:", data);

            // Create invitations for all member emails (excluding owner)
            const invitationsToCreate = memberEmails.filter(
              (email: string) => email !== ownerEmail
            );

            if (invitationsToCreate.length > 0) {
              // console.log("🔔 Creating invitations for:", invitationsToCreate);

              // Get user IDs for emails if they exist
              for (const email of invitationsToCreate) {
                const { data: userData } = await supabase
                  .from("db_users")
                  .select("id")
                  .eq("email", email)
                  .single();

                const invitationData = {
                  shared_table_id: data.id,
                  inviter_user_id: ownerUserId,
                  invitee_email: email,
                  invitee_user_id: userData?.id || null,
                  status: "pending",
                };

                const { error: invitationError } = await supabase
                  .from("coop_invitations")
                  .insert(invitationData);

                if (invitationError) {
                  // console.error(
                  //   `❌ Error creating invitation for ${email}:`,
                  //   invitationError
                  // );
                } else {
                  // console.log(`✅ Created invitation for ${email}`);
                }
              }
            }

            return data;
          } catch (error) {
            // console.error("❌ Create shared table failed:", error);
            return null;
          }
        },
        checkCoopTables: async () => {
          try {
            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            const { data: tables, error } = await supabase
              .from("coop_todos_shared")
              .select("*");

            if (error) {
              // console.error("Error checking coop_todos_shared:", error);
              return null;
            }

            // console.log("Current coop_todos_shared:", tables);
            return tables;
          } catch (error) {
            // console.error("Check coop tables failed:", error);
            return null;
          }
        },
        checkCoopInvitations: async () => {
          try {
            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            const { data: invitations, error } = await supabase
              .from("coop_invitations")
              .select("*");

            if (error) {
              // console.error("Error checking coop_invitations:", error);
              return null;
            }

            // console.log("Current coop_invitations:", invitations);
            return invitations;
          } catch (error) {
            // console.error("Check coop invitations failed:", error);
            return null;
          }
        },
        getUserIdByEmail: async (email: string) => {
          try {
            const supabase = createClient(
              "http://127.0.0.1:54321",
              "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
            );

            const { data: user, error } = await supabase
              .from("db_users")
              .select("id")
              .eq("email", email)
              .single();

            if (error) {
              // console.error(`Error getting user ID for ${email}:`, error);
              return null;
            }

            // console.log(`User ID for ${email}:`, user?.id);
            return user?.id;
          } catch (error) {
            // console.error("Get user ID failed:", error);
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
