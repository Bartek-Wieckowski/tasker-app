import { useMyPendingInvitations } from "@/api/queries/coopTodos/useCoopTodos";
import { useAuth } from "@/contexts/AuthContext";

type CoopTodosBadgeProps = {
  badgeAbsolutePosition?: boolean;
};

export default function CoopTodosBadge({
  badgeAbsolutePosition = false,
}: CoopTodosBadgeProps) {
  const { currentUser } = useAuth();
  const { data: pendingInvitations } = useMyPendingInvitations();

  if (badgeAbsolutePosition) {
    return (
      <>
        {pendingInvitations &&
          currentUser &&
          pendingInvitations.filter(
            (inv) => inv.invitee_email === currentUser.email
          ).length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] rounded-full px-1.5 py-0.5">
              {
                pendingInvitations.filter(
                  (inv) => inv.invitee_email === currentUser.email
                ).length
              }
            </span>
          )}
      </>
    );
  }

  return (
    <>
      {pendingInvitations &&
        currentUser &&
        pendingInvitations.filter(
          (inv) => inv.invitee_email === currentUser.email
        ).length > 0 && (
          <span className="ml-2 inline-flex items-center rounded-full bg-teal-400 px-2.5 py-0.5 text-xs font-medium text-white">
            {
              pendingInvitations.filter(
                (inv) => inv.invitee_email === currentUser.email
              ).length
            }
          </span>
        )}
    </>
  );
}
