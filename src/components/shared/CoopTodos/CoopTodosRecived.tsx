import { useMyReceivedInvitations } from "@/api/queries/coopTodos/useCoopTodos";
import { useLanguage } from "@/contexts/LanguageContext";
import { getInvitationStatus, formatExpirationMessage } from "@/lib/helpers";
import { cn } from "@/lib/utils";

export default function CoopTodosRecived() {
  const { currentLanguage } = useLanguage();
  const { data: receivedInvitations, isLoading: receivedLoading } =
    useMyReceivedInvitations();
  return (
    <>
      {receivedLoading ? (
        <div className="text-center py-8">Ładowanie...</div>
      ) : receivedInvitations && receivedInvitations.length > 0 ? (
        <div className="space-y-3">
          {receivedInvitations.map((invitation) => {
            const actualStatus = getInvitationStatus(
              invitation.status,
              invitation.expires_at
            );
            const expirationMessage = formatExpirationMessage(
              invitation.expires_at,
              currentLanguage,
              actualStatus
            );

            return (
              <div
                key={invitation.id}
                className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-sm">
                      Zaproszenie do: {invitation.table_name}
                    </h3>
                    {invitation.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {invitation.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Zaprasza: {invitation.inviter_email}</div>
                    {expirationMessage && (
                      <div
                        className={cn(
                          actualStatus === "expired" &&
                            "text-red-600 font-medium"
                        )}
                      >
                        {expirationMessage}
                      </div>
                    )}
                    <div className="mt-2">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                          {
                            "bg-green-100 text-green-800":
                              actualStatus === "accepted",
                            "bg-gray-100 text-gray-800":
                              actualStatus === "expired",
                            "bg-yellow-100 text-yellow-800":
                              actualStatus === "pending",
                            "bg-red-100 text-red-800":
                              actualStatus === "declined",
                          }
                        )}
                      >
                        {actualStatus === "accepted" && "Przyjęte"}
                        {actualStatus === "declined" && "Odrzucone"}
                        {actualStatus === "pending" && "Oczekuje"}
                        {actualStatus === "expired" && "Wygasło"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Brak historii zaproszeń
        </div>
      )}
    </>
  );
}
