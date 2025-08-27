import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Info } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/shared/Loader";
import { useDelegatedTodos } from "@/api/queries/delegatedTodos/useDelegatedTodos";
import { useAddDelegatedTodo } from "@/api/mutations/delegatedTodos/useAddDelegatedTodo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { DelegatedTodoForm } from "./DelegatedTodoForm";
import { UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DelegatedListIcon } from "../Icons";
import { useViewportKeyboard } from "@/hooks/useViewportKeyboard";
import DelegatedTodosList from "./DelegatedTodosList";

export default function DelegatedTodos() {
  const { t } = useTranslation();
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const keyboardHeight = useViewportKeyboard(inputRef);
  const { currentUser } = useAuth();
  const { delegatedTodos, isLoading } = useDelegatedTodos(
    currentUser.accountId
  );
  const { createDelegatedTodo, isCreatingDelegatedTodo } = useAddDelegatedTodo(
    currentUser.accountId
  );

  const handleAddSubmit = (
    data: { todo: string },
    form: UseFormReturn<{ todo: string }>
  ) => {
    createDelegatedTodo(data.todo, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="cursor-pointer" data-testid="delegated-todos-trigger">
          <DelegatedListIcon size={30} />
        </div>
      </DrawerTrigger>
      <DrawerContent
        ref={formContainerRef}
        className="h-[90svh] bg-stone-50"
        style={{
          paddingBottom: keyboardHeight > 0 ? `${keyboardHeight}px` : undefined,
        }}
      >
        <div className="mx-auto w-full max-w-md h-full relative">
          <DrawerHeader className="absolute top-0 left-0 right-0 pb-4 bg-stone-50 z-10">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold">
                {t("delegatedTodos.title")} ({delegatedTodos?.length || 0})
              </DrawerTitle>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-800"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t("delegatedTodos.description")}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DrawerDescription className="sr-only">
              {t("delegatedTodos.description")}
            </DrawerDescription>
          </DrawerHeader>

          <div
            className="px-2 overflow-hidden"
            style={{
              height: `calc(90svh - 15rem - ${keyboardHeight}px)` /* 240px for header + form */,
              marginTop: "5rem" /* space for header */,
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar space-y-2 pr-2 pb-24">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : delegatedTodos && delegatedTodos.length > 0 ? (
                <DelegatedTodosList delegatedTodos={delegatedTodos} />
              ) : (
                <p className="text-center text-gray-500 py-8">
                  {t("common.todosListEmpty")}
                </p>
              )}
            </div>
          </div>

          <div className="absolute bottom-2 left-0 right-0 bg-white backdrop-blur-sm p-4 rounded-lg shadow-md border-t border-stone-200 z-10">
            <DelegatedTodoForm
              type="add"
              onSubmit={handleAddSubmit}
              isLoading={isCreatingDelegatedTodo}
              inputRef={inputRef}
            />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
