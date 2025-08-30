import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AuthContextType, User } from "@/types/types";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";
import { getUserCustomAvatar } from "@/api/apiUsers";
import { STARTER_USER_AVATAR_URL } from "@/lib/constants";

const initialUser: User = {
  accountId: "",
  username: "",
  email: "",
  imageUrl: "",
  providerId: "",
};

const initialState: AuthContextType = {
  currentUser: initialUser,
  setCurrentUser: () => {},
  isLoading: true,
  isAuth: false,
  selectedDate: new Date().toISOString().split("T")[0], // Default today's date
  setSelectedDate: () => {},
};

const AuthContext = createContext<AuthContextType>(initialState);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const { t } = useTranslation();

  const handleAuthState = async (session: Session | null) => {
    if (session?.user) {
      const user = session.user;

      let imageUrl = user.user_metadata?.avatar_url;

      if (user.app_metadata?.provider === "google") {
        try {
          const customAvatarPromise = getUserCustomAvatar(user.id);
          const timeoutPromise = new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), 2000)
          );

          const customAvatarUrl = await Promise.race([
            customAvatarPromise,
            timeoutPromise,
          ]);
          if (customAvatarUrl) {
            imageUrl = customAvatarUrl;
          }
        } catch (error) {
          console.warn(
            "Custom avatar check failed, using OAuth avatar:",
            error
          );
        }
      }

      if (!imageUrl) {
        imageUrl = STARTER_USER_AVATAR_URL;
      }

      const userData: User = {
        accountId: user.id,
        email: user.email || "",
        username:
          user.user_metadata?.username ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "",
        imageUrl,
        providerId: user.app_metadata?.provider || "email",
      };

      setCurrentUser(userData);
      setIsAuth(true);
    } else {
      setCurrentUser(initialUser);
      setIsAuth(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        await handleAuthState(session);
      } catch (error) {
        setCurrentUser(initialUser);
        setIsAuth(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await handleAuthState(session);
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;

    const hasOAuthTokens =
      hash.includes("access_token") || hash.includes("refresh_token");

    if (hasOAuthTokens) {
      const recheckSession = async () => {
        setIsLoading(true);
        try {
          const {
            data: { session },
          } = await supabase.auth.getSession();
          await handleAuthState(session);

          if (session?.user) {
            try {
              await supabase.functions.invoke("sync_user", {
                body: {
                  id: session.user.id,
                  email: session.user.email,
                },
              });
            } catch (error) {
              console.warn("Failed to sync OAuth user to db_users:", error);
            }
          }

          toast({
            title: t("toastMsg.loginSuccess"),
            description: t("toastMsg.welcomeMessage"),
          });
        } catch (err) {
          setCurrentUser(initialUser);
          setIsAuth(false);
        } finally {
          setIsLoading(false);

          window.history.replaceState(null, "", window.location.pathname);
        }
      };

      recheckSession();
    }
  }, [t]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        isAuth,
        selectedDate,
        setSelectedDate,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("AuthContext was used outside AuthProvider");
  return context;
}
