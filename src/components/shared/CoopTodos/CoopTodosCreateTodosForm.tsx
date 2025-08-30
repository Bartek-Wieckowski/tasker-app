import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSharedTable } from "@/api/mutations/coopTodos/useCreateSharedTable";
import { useUpdateSharedTable } from "@/api/mutations/coopTodos/useUpdateSharedTable";
import { useInviteToSharedTable } from "@/api/mutations/coopTodos/useInviteToSharedTable";
import { useSharedTableById } from "@/api/queries/coopTodos/useCoopTodos";
import { useToast } from "@/components/ui/use-toast";
import { createTableSchema, CreateTableValues } from "@/validators/validators";
import { useTranslation } from "react-i18next";

type Step = "create-table" | "invite-users";

type CoopTodosCreateTodosFormProps = {
  editingTableId?: string | null;
  invitingTableId?: string | null;
  onClose?: () => void;
};

export default function CoopTodosCreateTodosForm({
  editingTableId = null,
  invitingTableId = null,
  onClose,
}: CoopTodosCreateTodosFormProps = {}) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step>("create-table");
  const [createdTableId, setCreatedTableId] = useState<string | null>(null);

  const { toast } = useToast();
  const { createSharedTableMutation, isCreatingSharedTable } =
    useCreateSharedTable();
  const { updateSharedTableMutation, isUpdatingSharedTable } =
    useUpdateSharedTable();
  const { inviteToSharedTableMutation, isInvitingToSharedTable } =
    useInviteToSharedTable();

  const { data: editingTableData } = useSharedTableById(editingTableId || "");

  const tableForm = useForm<CreateTableValues>({
    resolver: zodResolver(createTableSchema(t)),
    defaultValues: {
      tableName: "",
      description: "",
    },
  });

  const [emails, setEmails] = useState<string[]>([""]);

  const getMode = () => {
    if (invitingTableId) return "invite";
    if (editingTableId) return "edit";
    return "create";
  };

  const mode = getMode();

  useEffect(() => {
    if (isOpen && (invitingTableId || editingTableId)) {
      if (invitingTableId) {
        setCurrentStep("invite-users");
        setCreatedTableId(invitingTableId);
        setEmails([""]);
      } else if (editingTableId && editingTableData) {
        setCurrentStep("create-table");
        setCreatedTableId(editingTableId);
        tableForm.reset({
          tableName: editingTableData.table_name || "",
          description: editingTableData.description || "",
        });
        setEmails([""]);
      }
    }
  }, [isOpen, invitingTableId, editingTableId, editingTableData, tableForm]);

  useEffect(() => {
    if (editingTableId || invitingTableId) {
      setIsOpen(true);
    }
  }, [editingTableId, invitingTableId]);

  const handleTableSubmit = async (data: CreateTableValues) => {
    try {
      if (mode === "edit") {
        await updateSharedTableMutation({
          sharedTableId: editingTableId!,
          tableName: data.tableName.trim(),
          description: data.description?.trim() || undefined,
        });

        toast({
          title: t("coopTodos.tableUpdated"),
        });

        setIsOpen(false);
        onClose?.();
      } else {
        const tableId = await createSharedTableMutation({
          tableName: data.tableName.trim(),
          description: data.description?.trim() || undefined,
        });

        setCreatedTableId(tableId);
        setCurrentStep("invite-users");

        toast({
          title: t("coopTodos.tableCreated"),
        });
      }
    } catch (error) {
      toast({
        title: t("toastMsg.todosFailed"),

        variant: "destructive",
      });
    }
  };

  const handleInviteSubmit = async () => {
    const tableId = createdTableId || invitingTableId;
    if (!tableId) return;

    const validEmails = emails.filter((email) => email.trim());

    if (validEmails.length === 0) {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
      return;
    }

    try {
      await Promise.all(
        validEmails.map((email) =>
          inviteToSharedTableMutation({
            sharedTableId: tableId,
            inviteeEmail: email.trim(),
          })
        )
      );

      toast({
        title:
          t("coopTodos.send") +
          " " +
          validEmails.length +
          " " +
          t("coopTodos.invitationsSent"),
      });

      setEmails([""]);
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: t("toastMsg.todosFailed"),
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const handleGoToInviteUsers = () => {
    setCurrentStep("invite-users");
  };

  const addEmailField = () => {
    setEmails([...emails, ""]);
  };

  const removeEmailField = (index: number) => {
    if (emails.length > 1) {
      setEmails(emails.filter((_, i) => i !== index));
    }
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setCurrentStep("create-table");
          setCreatedTableId(null);
          setEmails([""]);
          tableForm.reset({ tableName: "", description: "" });
          onClose?.();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          data-testid="create-table-button"
          onClick={() => {
            setCurrentStep("create-table");
            setCreatedTableId(null);
            setEmails([""]);
            tableForm.reset({ tableName: "", description: "" });
            setIsOpen(true);
          }}
        >
          {t("coopTodos.createTable")}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {currentStep === "create-table"
              ? mode === "edit"
                ? t("coopTodos.editTable")
                : t("coopTodos.createTable")
              : mode === "invite"
              ? t("coopTodos.sendInvitations")
              : t("coopTodos.inviteUsers")}
          </DialogTitle>
        </DialogHeader>

        {currentStep === "create-table" && (
          <Form {...tableForm}>
            <form
              onSubmit={tableForm.handleSubmit(handleTableSubmit)}
              className="space-y-4"
            >
              <FormField
                control={tableForm.control}
                name="tableName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("coopTodos.tableName")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("coopTodos.tableNamePlaceholder")}
                        disabled={
                          isCreatingSharedTable || isUpdatingSharedTable
                        }
                        data-testid={
                          mode === "create"
                            ? "create-table-name-input"
                            : mode === "edit"
                            ? "edit-table-name-input"
                            : "invite-table-name-input"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={tableForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("coopTodos.tableDescription")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("coopTodos.descriptionPlaceholder")}
                        rows={3}
                        disabled={
                          isCreatingSharedTable || isUpdatingSharedTable
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreatingSharedTable || isUpdatingSharedTable}
                >
                  {t("common.cancel")}
                </Button>
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoToInviteUsers}
                    disabled={isCreatingSharedTable || isUpdatingSharedTable}
                  >
                    {t("coopTodos.addInvitations")}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isCreatingSharedTable || isUpdatingSharedTable}
                  data-testid={
                    mode === "create"
                      ? "create-table-submit-button"
                      : mode === "edit"
                      ? "edit-table-submit-button"
                      : "invite-table-submit-button"
                  }
                >
                  {mode === "edit"
                    ? isUpdatingSharedTable
                      ? t("common.updating")
                      : t("common.edit")
                    : isCreatingSharedTable
                    ? t("common.creating")
                    : t("common.create")}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === "invite-users" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("coopTodos.inviteUsersOptional")}</Label>
              <p className="text-sm text-muted-foreground">
                {mode === "create"
                  ? t("coopTodos.inviteUsersOptionalDescription")
                  : t("coopTodos.addInvitationsDescription")}
              </p>
            </div>

            {emails.map((email, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="email"
                  name="email"
                  id={`email-${index}`}
                  value={email}
                  onChange={(e) => updateEmail(index, e.target.value)}
                  placeholder="email@example.com"
                  disabled={isInvitingToSharedTable}
                />
                {emails.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeEmailField(index)}
                    disabled={isInvitingToSharedTable}
                  >
                    {t("common.delete")}
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addEmailField}
              disabled={isInvitingToSharedTable}
              className="w-full"
            >
              {t("common.add")} {t("common.email")}
            </Button>

            <div className="flex space-x-2 pt-4">
              {mode === "create" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("create-table")}
                  disabled={isInvitingToSharedTable}
                >
                  {t("common.back")}
                </Button>
              )}
              <Button
                onClick={handleInviteSubmit}
                disabled={isInvitingToSharedTable}
              >
                {isInvitingToSharedTable
                  ? t("common.sending")
                  : t("coopTodos.sendInvitations")}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
