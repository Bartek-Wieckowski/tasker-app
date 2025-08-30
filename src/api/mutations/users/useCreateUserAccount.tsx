import { NewUser } from "@/types/types";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "@/api/apiUsers";
import { useToast } from "@/components/ui/use-toast";
import { ROUTES } from "@/routes/constants";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function useCreateUserAccount() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    isPending,
    isError,
    mutateAsync: registerUserMutation,
  } = useMutation({
    mutationFn: (user: NewUser) =>
      registerUser(user.email, user.password, user.username),
    onSuccess: () => {
      navigate(ROUTES.home);
      toast({
        title: t("toastMsg.createAccountSuccess"),
        description: t("toastMsg.welcomeMessage"),
      });
    },
    onError: () => {
      toast({
        title: t("toastMsg.createAccountFailed"),
        variant: "destructive",
      });
    },
  });

  return { registerUser: registerUserMutation, isPending, isError };
}
