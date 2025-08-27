import { Plus } from "lucide-react";
import { Button } from "../../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import TodoForm from "./TodoForm";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function TodosAdd() {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="border-none bg-indigo-600 hover:bg-indigo-700 md:absolute md:bottom-24 md:right-2 rounded-full w-12 h-12 md:w-16 md:h-16 hover:-translate-y-1 transition-all duration-300 group active:-translate-y-1"
          data-testid="add-todo-button"
        >
          <Plus className="h-8 w-8 text-white group-hover:rotate-180 transition-transform duration-1000 group-active:rotate-180" />
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-y-auto max-h-screen custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{t("common.addNewTodo")}</DialogTitle>
        </DialogHeader>
        <TodoForm action="Create" onCloseDialog={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
