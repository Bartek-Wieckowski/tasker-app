import { useMutation } from "@tanstack/react-query";
import { updateUserSettings } from "@/api/apiUsers";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UpdateUser } from "@/types/types";
import { useTranslation } from "react-i18next";

export function useChangeSettingsAccount() {
  const { toast } = useToast();
  const { setCurrentUser } = useAuth();
  const { t } = useTranslation();

  const {
    isPending: isUpdatingSettings,
    isError,
    mutateAsync: updateSettings,
  } = useMutation({
    mutationFn: (user: UpdateUser) => updateUserSettings(user),
    onSuccess: (data) => {
      setCurrentUser(data);
      toast({ title: t("toastMsg.updateSettingsSuccess") });
    },
    onError: () => {
      toast({
        title: t("toastMsg.updateSettingsFailed"),
        variant: "destructive",
      });
    },
  });

  return { updateSettings, isUpdatingSettings, isError };
}
