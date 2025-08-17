import { PlusCircle } from "lucide-react";
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

const TodosAdd = () => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="border-none sm:border-solid"
          data-testid="add-todo-button"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-screen custom-scrollbar">
        <DialogHeader>
          <DialogTitle>{t("todosAdd.addNewTodo")}</DialogTitle>
        </DialogHeader>
        <TodoForm action="Create" onCloseDialog={() => setDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default TodosAdd;
