import { inviteToSharedTable } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useInviteToSharedTable() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isInvitingToSharedTable,
    isError,
    mutateAsync: inviteToSharedTableMutation,
  } = useMutation({
    mutationFn: ({
      sharedTableId,
      inviteeEmail,
    }: {
      sharedTableId: string;
      inviteeEmail: string;
    }) => inviteToSharedTable(sharedTableId, inviteeEmail),
    onSuccess: () => {
      // Invalidate pending invitations
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.coopTodosInvitations],
      });

      toast({
        title: t("toastMsg.inviteToSharedTableSuccess"),
        description: t("toastMsg.inviteToSharedTableSuccessDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.inviteToSharedTableFailed"),
        variant: "destructive",
      });
    },
  });

  return { isInvitingToSharedTable, isError, inviteToSharedTableMutation };
}
