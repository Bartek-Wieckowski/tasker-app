import { useAcceptInvitation } from "@/api/mutations/coopTodos/useAcceptInvitation";
import { useDeclineInvitation } from "@/api/mutations/coopTodos/useDeclineInvitation";
import { useMyPendingInvitations } from "@/api/queries/coopTodos/useCoopTodos";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { getInvitationStatus, formatExpirationMessage } from "@/lib/helpers";

export default function CoopTodosPending() {
  const { currentUser } = useAuth();
  const { currentLanguage } = useLanguage();
  const { data: pendingInvitations, isLoading: pendingLoading } =
    useMyPendingInvitations();
  const { declineInvitationMutation, isDecliningInvitation } =
    useDeclineInvitation();
  const { acceptInvitationMutation, isAcceptingInvitation } =
    useAcceptInvitation();

  return (
    <>
      {pendingLoading ? (
        <div className="text-center py-8">Ładowanie...</div>
      ) : pendingInvitations &&
        pendingInvitations.filter((inv) => {
          const actualStatus = getInvitationStatus(inv.status, inv.expires_at);
          return (
            actualStatus === "pending" &&
            inv.invitee_email === currentUser?.email
          );
        }).length > 0 ? (
        <div className="space-y-3">
          {pendingInvitations
            .filter((inv) => {
              const actualStatus = getInvitationStatus(
                inv.status,
                inv.expires_at
              );
              return (
                actualStatus === "pending" &&
                inv.invitee_email === currentUser?.email
              );
            })
            .map((invitation) => {
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
                      {expirationMessage && <div>{expirationMessage}</div>}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() =>
                          declineInvitationMutation(invitation.id!)
                        }
                        disabled={isDecliningInvitation}
                      >
                        {isDecliningInvitation ? "Odrzucanie..." : "Odrzuć"}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => acceptInvitationMutation(invitation.id!)}
                        disabled={isAcceptingInvitation}
                      >
                        {isAcceptingInvitation ? "Akceptowanie..." : "Akceptuj"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Brak oczekujących zaproszeń
        </div>
      )}
    </>
  );
}
