import { useMutation } from "@tanstack/react-query";
import { deleteAccount } from "@/api/apiUsers";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { ROUTES } from "@/routes/constants";
import { useTranslation } from "react-i18next";

export function useDeleteAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    isPending: isDeleting,
    isError,
    mutateAsync: deleteUser,
  } = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      navigate(ROUTES.home);
      toast({ title: t("toastMsg.deleteAccountSuccess") });
    },
    onError: () => {
      toast({
        title: t("toastMsg.deleteAccountFailed"),
        variant: "destructive",
      });
    },
  });

  return { deleteUser, isDeleting, isError };
}
