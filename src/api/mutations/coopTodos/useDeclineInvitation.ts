import { declineInvitation } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useDeclineInvitation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isDecliningInvitation,
    isError,
    mutateAsync: declineInvitationMutation,
  } = useMutation({
    mutationFn: (invitationId: string) => declineInvitation(invitationId),
    onSuccess: () => {
      // Invalidate pending invitations
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.coopTodosInvitations],
      });

      toast({
        title: t("toastMsg.declineInvitationSuccess"),
        description: t("toastMsg.declineInvitationSuccessDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.declineInvitationFailed"),
        variant: "destructive",
      });
    },
  });

  return { isDecliningInvitation, isError, declineInvitationMutation };
}
