import { useState } from "react";
import { useDeleteAccount } from "@/api/mutations/users/useDeleteAccount";
import { useLogoutAccount } from "@/api/mutations/users/useLogoutAccount";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogOut, PocketKnife } from "lucide-react";
import { Loader as LoaderIcon } from "lucide-react";
import Loader from "../Loader";
import UserSettingsFormInfo from "./UserSettingsFormInfo";
import UserSettingsFormPassword from "./UserSettingsFormPassword";
import { useTranslation } from "react-i18next";

const UserPanel = () => {
  const { deleteUser, isDeleting } = useDeleteAccount();
  const { logoutUser, isLogouting } = useLogoutAccount();
  const { currentUser } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild className="cursor-pointer">
        <Avatar>
          <AvatarImage
            src={currentUser?.imageUrl}
            alt={currentUser?.username}
            data-testid="user-avatar"
          />
          <AvatarFallback>
            <LoaderIcon className="animate-spin" />
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm">
            {t("app.userPanel.welcomeText")}{" "}
            <span className="text-teal-600 italic">
              {currentUser?.username}
            </span>{" "}
            !
          </p>
          {currentUser.providerId !== "google.com" && (
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <span className="flex items-center gap-2">
                    <PocketKnife className="w-[12px] h-[12px]" />
                    {t("app.userPanel.settings")}
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-screen custom-scrollbar">
                <DialogHeader>
                  <DialogTitle>{t("userSettingsForm.editProfile")}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 p-4">
                  <UserSettingsFormInfo />
                  <UserSettingsFormPassword />
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={() => logoutUser()}>
            {isLogouting ? (
              <div className="flex items-center gap-2">
                <Loader />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="w-[12px] h-[12px]" />
                {t("app.userPanel.logout")}
              </div>
            )}
          </Button>
          <Button variant="destructive" onClick={() => deleteUser()}>
            {isDeleting ? (
              <div className="flex gap-2">
                <Loader />
              </div>
            ) : (
              <>{t("app.userPanel.deleteAccount")}</>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserPanel;
