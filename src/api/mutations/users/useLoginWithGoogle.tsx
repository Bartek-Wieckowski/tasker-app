import { useMutation } from "@tanstack/react-query";
import { loginAccountWithGoogle } from "@/api/apiUsers";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/constants";
import { useTranslation } from "react-i18next";

export function useLoginWithGoogle() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const { mutateAsync: loginUserWithGoogle } = useMutation({
    mutationFn: () => loginAccountWithGoogle(),
    onSuccess: () => {
      navigate(ROUTES.home);
    },
    onError: () => {
      toast({
        title: t("toastMsg.loginFailed"),
        variant: "destructive",
      });
    },
  });

  return { loginUserWithGoogle };
}
