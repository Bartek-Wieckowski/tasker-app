import { useMutation } from "@tanstack/react-query";
import { loginAccount } from "@/api/apiUsers";
import { LoginUser } from "@/types/types";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/constants";
import { useTranslation } from "react-i18next";

export function useLoginAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const {
    isPending,
    isError,
    mutateAsync: loginUser,
  } = useMutation({
    mutationFn: (user: LoginUser) => loginAccount(user.email, user.password),
    onSuccess: () => {
      navigate(ROUTES.home);
      toast({
        title: t("toastMsg.loginSuccess"),
        description: t("toastMsg.welcomeMessage"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.loginFailed"),
        variant: "destructive",
      });
    },
  });

  return { loginUser, isPending, isError };
}
