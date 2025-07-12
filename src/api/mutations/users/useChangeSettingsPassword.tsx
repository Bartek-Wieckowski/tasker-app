import { useMutation } from "@tanstack/react-query";
import { updateUserPassword } from "@/api/apiUsers";
import { useToast } from "@/components/ui/use-toast";
import { UpdateUserPassword } from "@/types/types";
import { useTranslation } from "react-i18next";

export function useChangeSettingsPassword() {
  const { toast } = useToast();
  const { t } = useTranslation();

  const {
    isPending: isUpdatingPassword,
    isError,
    mutateAsync: updateSettingsPassword,
  } = useMutation({
    mutationFn: (userPass: UpdateUserPassword) => updateUserPassword(userPass),
    onSuccess: () => {
      toast({ title: t("toastMsg.updatePasswordSuccess") });
    },
    onError: () => {
      toast({
        title: t("toastMsg.updatePasswordFailed"),
        variant: "destructive",
      });
    },
  });

  return { updateSettingsPassword, isUpdatingPassword, isError };
}
