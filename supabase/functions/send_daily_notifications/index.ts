import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";
import webpush from "npm:web-push@3.6.7";

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
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🔔 Starting daily notifications check...");

    // Konfiguracja web-push z VAPID keys
    const vapidPublicKey = Deno.env.get("VITE_VAPID_PUBLIC_KEY");
    const vapidPrivateKey = Deno.env.get("VAPID_PRIVATE_KEY");
    const vapidEmail =
      Deno.env.get("VAPID_EMAIL") || "mailto:admin@example.com";

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error(
        "VAPID keys nie są skonfigurowane w environment variables"
      );
    }

    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey);
    console.log("✅ Web-push skonfigurowany z VAPID keys");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );

    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format
    console.log(`📅 Checking todos for date: ${today}`);

    // Pobierz użytkowników z niezrealizowanymi zadaniami na dziś
    const { data: usersWithTodos, error: todosError } = await supabase
      .from("db_users")
      .select(
        `
        id,
        email,
<<<<<<< HEAD
=======
        lang,
>>>>>>> origin/main
        todos!inner(id, is_completed, todo_date)
      `
      )
      .eq("is_active", true)
      .eq("todos.todo_date", today)
      .eq("todos.is_completed", false);

    if (todosError) {
      console.error("❌ Error fetching users with todos:", todosError);

      await supabase.from("notification_logs").insert({
        user_id: null,
        notification_type: "daily_reminder",
        message: "Error fetching todos",
        incomplete_todos_count: 0,
        status: "failed",
        error_message: JSON.stringify(todosError),
        sent_at: new Date().toISOString(),
      });

      throw todosError;
    }

    console.log(`📊 Raw query result:`, {
      count: usersWithTodos?.length || 0,
      data: usersWithTodos?.slice(0, 3), // First 3 records for debugging
    });

    if (!usersWithTodos || usersWithTodos.length === 0) {
      console.log("ℹ️ No users with incomplete todos found");

      await supabase.from("notification_logs").insert({
        user_id: null,
        notification_type: "daily_reminder",
        message: "Skipped - no incomplete todos for any user",
        incomplete_todos_count: 0,
        status: "skipped",
        sent_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: "No users with incomplete todos found",
          notifications_sent: 0,
          date: today,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Grupuj todos według użytkownika
    const userTodoCounts: Record<
      string,
<<<<<<< HEAD
      { id: string; email: string; count: number }
    > = {};
    usersWithTodos.forEach(
      (user: { id: string; email: string; todos: unknown[] }) => {
=======
      { id: string; email: string; lang: string; count: number }
    > = {};
    usersWithTodos.forEach(
      (user: { id: string; email: string; lang: string; todos: unknown[] }) => {
>>>>>>> origin/main
        if (!userTodoCounts[user.id]) {
          userTodoCounts[user.id] = {
            id: user.id,
            email: user.email,
<<<<<<< HEAD
=======
            lang: user.lang || "en",
>>>>>>> origin/main
            count: 0,
          };
        }
        // Zlicz todos w tym rekordzie użytkownika, nie samego użytkownika
        userTodoCounts[user.id].count += user.todos ? user.todos.length : 1;
      }
    );

    const usersToNotify = Object.values(userTodoCounts);
    console.log(`📊 Found ${usersToNotify.length} users with incomplete todos`);

    let notificationsSent = 0;
    let errors = 0;

    // Wysyłanie powiadomień
    for (const user of usersToNotify) {
      try {
        console.log(
          `👤 Processing user: ${user.email} (${user.count} incomplete todos)`
        );

        // Pobierz aktywne push subscriptions
        const { data: subscriptions, error: subscriptionsError } =
          await supabase
            .from("push_subscriptions")
            .select("endpoint, p256dh_key, auth_key")
            .eq("user_id", user.id)
            .eq("is_active", true);

        if (subscriptionsError) {
          console.error(
            `❌ Error fetching subscriptions for ${user.email}:`,
            subscriptionsError
          );

          await supabase.from("notification_logs").insert({
            user_id: user.id,
            notification_type: "daily_reminder",
            message: "Error fetching subscriptions",
            incomplete_todos_count: user.count,
            status: "failed",
            error_message: JSON.stringify(subscriptionsError),
            sent_at: new Date().toISOString(),
          });

          errors++;
          continue;
        }

        if (!subscriptions || subscriptions.length === 0) {
          console.log(`⚠️ No active push subscriptions for ${user.email}`);

          await supabase.from("notification_logs").insert({
            user_id: user.id,
            notification_type: "daily_reminder",
            message: "Skipped - no active subscriptions",
            incomplete_todos_count: user.count,
            status: "skipped",
            sent_at: new Date().toISOString(),
          });

          continue;
        }

<<<<<<< HEAD
        // Payload
        const notificationPayload = {
          title: "Niezrealizowane zadania",
          body: `Masz ${user.count} ${
            user.count === 1
              ? "niezrealizowane zadanie"
              : "niezrealizowanych zadań"
          } na dziś`,
=======
        // Payload z obsługą języków - defensywne sprawdzenie
        const userLanguage = user.lang || "en"; // fallback na wypadek NULL/undefined
        const isPolish = userLanguage === "pl";
        const notificationPayload = {
          title: isPolish ? "Niezrealizowane zadania" : "Incomplete tasks",
          body: isPolish
            ? `Masz ${user.count} ${
                user.count === 1
                  ? "niezrealizowane zadanie"
                  : "niezrealizowanych zadań"
              } na dziś`
            : `You have ${user.count} incomplete ${
                user.count === 1 ? "task" : "tasks"
              } for today`,
>>>>>>> origin/main
          icon: "/vite.svg",
          badge: "/vite.svg",
          data: { url: "/", user_id: user.id, date: today, count: user.count },
        };

        // Wyślij dla każdej subskrypcji
        for (const subscription of subscriptions) {
          let notificationStatus = "sent";
          let errorMessage: string | null = null;

          try {
            const pushSubscription = {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh_key,
                auth: subscription.auth_key,
              },
            };

            const pushResult = await webpush.sendNotification(
              pushSubscription,
              JSON.stringify(notificationPayload),
              { TTL: 24 * 60 * 60, urgency: "normal", topic: "daily-todos" }
            );

            console.log(`✅ Push sent to ${user.email}`, {
              statusCode: pushResult.statusCode,
            });

            notificationsSent++;
          } catch (pushError: unknown) {
            console.error(`❌ Error sending push to ${user.email}:`, pushError);

            notificationStatus = "failed";
            errorMessage =
              pushError instanceof Error
                ? pushError.message
                : String(pushError);
            errors++;

            if ((pushError as { statusCode?: number })?.statusCode === 410) {
              console.log(
                `🗑️ Deactivating expired subscription for ${user.email}`
              );
              await supabase
                .from("push_subscriptions")
                .update({ is_active: false })
                .eq("endpoint", subscription.endpoint);
            }
          }

          // Zawsze loguj wynik
          await supabase.from("notification_logs").insert({
            user_id: user.id,
            notification_type: "daily_reminder",
            message: notificationPayload.body,
            incomplete_todos_count: user.count,
            status: notificationStatus,
            error_message: errorMessage,
            sent_at: new Date().toISOString(),
          });
        }
      } catch (userError: unknown) {
        console.error(`❌ Error processing user ${user.email}:`, userError);

        await supabase.from("notification_logs").insert({
          user_id: user.id,
          notification_type: "daily_reminder",
          message: "Error processing user notifications",
          incomplete_todos_count: user.count,
          status: "failed",
          error_message:
            userError instanceof Error ? userError.message : String(userError),
          sent_at: new Date().toISOString(),
        });

        errors++;
      }
    }

    console.log(
      `📈 Daily notifications complete. Sent: ${notificationsSent}, Errors: ${errors}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Daily notifications processed",
        users_checked: usersToNotify.length,
        notifications_sent: notificationsSent,
        errors,
        date: today,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("❌ Error in send_daily_notifications:", error);

    // Log global error
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    );
    await supabase.from("notification_logs").insert({
      user_id: null,
      notification_type: "daily_reminder",
      message: "Global error in edge function",
      incomplete_todos_count: 0,
      status: "failed",
      error_message: error instanceof Error ? error.message : String(error),
      sent_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
