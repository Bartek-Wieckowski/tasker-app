import { acceptInvitation } from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";
import { useToast } from "@/components/ui/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

export function useAcceptInvitation() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    isPending: isAcceptingInvitation,
    isError,
    mutateAsync: acceptInvitationMutation,
  } = useMutation({
    mutationFn: (invitationId: string) => acceptInvitation(invitationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.coopTodosInvitations],
      });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodosShared] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.coopTodos] });

      toast({
        title: t("toastMsg.acceptInvitationSuccess"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    },
  });

  return { isAcceptingInvitation, isError, acceptInvitationMutation };
}
