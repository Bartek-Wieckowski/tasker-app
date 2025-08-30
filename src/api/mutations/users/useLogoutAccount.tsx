import { useMutation } from "@tanstack/react-query";
import { logoutAccount } from "@/api/apiUsers";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/constants";
import { useToast } from "@/components/ui/use-toast";
import { useTranslation } from "react-i18next";

export function useLogoutAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    isPending: isLogouting,
    isError,
    mutateAsync: logoutUser,
  } = useMutation({
    mutationFn: logoutAccount,
    onSuccess: () => {
      navigate(ROUTES.home);
    },
    onError: () => {
      toast({
        title: t("toastMsg.logoutFailed"),
        variant: "destructive",
      });
    },
  });

  return { logoutUser, isLogouting, isError };
}
