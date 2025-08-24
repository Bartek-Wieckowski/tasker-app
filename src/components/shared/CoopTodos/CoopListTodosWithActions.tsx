import { useMySharedTables } from "@/api/queries/coopTodos/useCoopTodos";
import { useCoopTodosByTableId } from "@/api/queries/coopTodos/useCoopTodos";
import { useDeleteSharedTable } from "@/api/mutations/coopTodos/useDeleteSharedTable";
import { useLeaveSharedTable } from "@/api/mutations/coopTodos/useLeaveSharedTable";
import { Button } from "@/components/ui/button";
import CoopMembersPopup from "./CoopMembersPopup";
import CoopTodosDrawer from "./CoopTodosDrawer";
import { MousePointerClick } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

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
        <div className="space-y-3 custom-scrollbar overflow-y-auto max-h-[500px]">
          {sharedTables.map((table) => (
            <div
              key={table.id}
              className="rounded-lg border bg-card p-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <CoopTodosDrawer
                      tableId={table.id || ""}
                      tableName={table.table_name || ""}
                    >
                      <h3 className="font-semibold text-base cursor-pointer hover:text-primary transition-colors flex items-center gap-2">
                        {table.table_name}
                        <MousePointerClick className="w-4 h-4" />
                      </h3>
                    </CoopTodosDrawer>
                    <p className="text-sm text-muted-foreground">
                      {table.description || "Brak opisu"}
                    </p>
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
                <div className="flex space-x-2">
                  {table.my_role === "owner" ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setEditingTableId(table.id || "")}
                        disabled={isDeletingSharedTable}
                      >
                        {t("common.edit")}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        onClick={() =>
                          handleDeleteTable(
                            table.id || "",
                            table.table_name || ""
                          )
                        }
                        disabled={isDeletingSharedTable}
                      >
                        {isDeletingSharedTable
                          ? t("common.deleting")
                          : t("common.delete")}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        onClick={() => setInvitingTableId(table.id || "")}
                        disabled={isDeletingSharedTable}
                      >
                        {t("coopTodos.sendInvitation")}
                      </Button>
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
