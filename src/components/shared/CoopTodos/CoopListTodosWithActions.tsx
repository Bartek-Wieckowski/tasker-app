import { useMySharedTables } from "@/api/queries/coopTodos/useCoopTodos";
import { useCoopTodosByTableId } from "@/api/queries/coopTodos/useCoopTodos";
import { useDeleteSharedTable } from "@/api/mutations/coopTodos/useDeleteSharedTable";
import { useLeaveSharedTable } from "@/api/mutations/coopTodos/useLeaveSharedTable";
import { Button } from "@/components/ui/button";
import CoopMembersPopup from "./CoopMembersPopup";
import CoopTodosDrawer from "./CoopTodosDrawer";
import { Edit, Trash2, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function TodoCount({ tableId }: { tableId: string }) {
  const { data: todos } = useCoopTodosByTableId(tableId);
  return <span>{todos?.length || 0}</span>;
}

type CoopListTodosWithActionsProps = {
  setEditingTableId: (id: string) => void;
  setInvitingTableId: (id: string) => void;
};

export default function CoopListTodosWithActions({
  setEditingTableId,
  setInvitingTableId,
}: CoopListTodosWithActionsProps) {
  const { t } = useTranslation();
  const { data: sharedTables, isLoading: tablesLoading } = useMySharedTables();
  const { deleteSharedTableMutation, isDeletingSharedTable } =
    useDeleteSharedTable();
  const { leaveSharedTableMutation, isLeavingSharedTable } =
    useLeaveSharedTable();

  const handleDeleteTable = async (tableId: string, tableName: string) => {
    if (
      window.confirm(
        t("coopTodos.deleteTable") +
          " " +
          tableName +
          " " +
          t("coopTodos.deleteTableDescription")
      )
    ) {
      try {
        await deleteSharedTableMutation(tableId);
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  const handleLeaveTable = async (tableId: string, tableName: string) => {
    if (
      window.confirm(
        t("coopTodos.areYouSureLeaveTable") +
          " " +
          tableName +
          " " +
          t("coopTodos.leaveTableDescription")
      )
    ) {
      try {
        await leaveSharedTableMutation({ sharedTableId: tableId });
      } catch (error) {
        // Error is handled by the mutation hook
      }
    }
  };

  return (
    <>
      {tablesLoading ? (
        <div className="text-center py-8">{t("common.loading")}</div>
      ) : sharedTables && sharedTables.length > 0 ? (
        <div className="space-y-3 custom-scrollbar overflow-y-auto pb-2">
          {sharedTables.map((table) => (
            <div
              key={table.id}
              data-testid="coop-table-task-item"
              className="rounded-lg shadow-md bg-white p-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CoopTodosDrawer
                      tableId={table.id || ""}
                      tableName={table.table_name || ""}
                    >
                      <h3 className="font-semibold text-base cursor-pointer hover:text-primary transition-colors flex items-center gap-2 underline text-indigo-600">
                        {table.table_name}
                      </h3>
                    </CoopTodosDrawer>
                    {table.description && (
                      <p className="text-sm text-muted-foreground">
                        {table.description}
                      </p>
                    )}
                    <div className="flex items-start space-x-2 text-xs text-muted-foreground">
                      <div className="flex flex-col gap-y-2">
                        <span>
                          {t("coopTodos.tasks")}:{" "}
                          <TodoCount tableId={table.id || ""} />
                        </span>
                        <span>
                          {t("coopTodos.owner")}: {table.owner_email}
                        </span>
                      </div>
                      <span>•</span>
                      <CoopMembersPopup
                        memberEmails={table.member_emails || []}
                        ownerEmail={table.owner_email || ""}
                        memberCount={table.member_count || 0}
                      />
                    </div>
                  </div>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      table.my_role === "owner"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    )}
                  >
                    {table.my_role === "owner"
                      ? t("coopTodos.owner")
                      : t("coopTodos.member")}
                  </span>
                </div>
                <div className="flex space-x-2 justify-end">
                  {table.my_role === "owner" ? (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="group flex-shrink-0 transition-colors"
                              onClick={() => setEditingTableId(table.id || "")}
                              disabled={isDeletingSharedTable}
                            >
                              <Edit className="text-purple-400 group-hover:text-purple-600 transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("common.edit")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="group flex-shrink-0 transition-colors"
                              onClick={() =>
                                handleDeleteTable(
                                  table.id || "",
                                  table.table_name || ""
                                )
                              }
                              disabled={isDeletingSharedTable}
                            >
                              <Trash2 className="text-red-400 group-hover:text-red-600 transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("common.delete")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="group flex-shrink-0 transition-colors"
                              onClick={() => setInvitingTableId(table.id || "")}
                              disabled={isDeletingSharedTable}
                            >
                              <Send className="text-teal-400 group-hover:text-teal-600 transition-colors" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{t("coopTodos.sendInvitation")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        handleLeaveTable(table.id || "", table.table_name || "")
                      }
                      disabled={isLeavingSharedTable}
                    >
                      {isLeavingSharedTable
                        ? t("common.leaving")
                        : t("coopTodos.leaveTable")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("coopTodos.noTables")}
        </div>
      )}
    </>
  );
}
