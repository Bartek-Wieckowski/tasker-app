import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

type CoopMembersPopupProps = {
  memberEmails: string[];
  ownerEmail: string;
  memberCount: number;
};

export default function CoopMembersPopup({
  memberEmails,
  ownerEmail,
  memberCount,
}: CoopMembersPopupProps) {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
        >
          <Users className="w-3 h-3 mr-1" />
          {t("coopTodos.members")}: {memberCount}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[25rem] w-full" align="start">
        <div className="space-y-3">
          <h4 className="font-medium text-sm">{t("coopTodos.membersList")}</h4>
          <div className="space-y-2">
            {memberEmails.map((email) => (
              <div
                key={email}
                className="flex items-center justify-between text-sm gap-x-3"
              >
                <span className="truncate">{email}</span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    email === ownerEmail
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {email === ownerEmail
                    ? t("coopTodos.owner")
                    : t("coopTodos.member")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
