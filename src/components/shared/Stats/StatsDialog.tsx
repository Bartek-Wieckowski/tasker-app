import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import MobileStatsView from "./MobileStatsView";
import { useTranslation } from "react-i18next";

type StatsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function StatsDialog({ open, onOpenChange }: StatsDialogProps) {
  const { t } = useTranslation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg max-h-[90vh] overflow-y-auto"
        data-testid="stats-dialog-content"
      >
        <DialogHeader>
          <DialogTitle>{t("stats.status")}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <MobileStatsView />
        </div>
      </DialogContent>
    </Dialog>
  );
}
