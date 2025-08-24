import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// Schematy walidacji
const createTableSchema = z.object({
  tableName: z
    .string()
    .min(2, "Nazwa tabeli musi mieć co najmniej 2 znaki")
    .max(25, "Nazwa tabeli nie może przekroczyć 25 znaków"),
  description: z
    .string()
    .max(75, "Opis nie może przekroczyć 75 znaków")
    .optional(),
});

type CreateTableForm = z.infer<typeof createTableSchema>;

type Step = "create-table" | "invite-users";

interface CoopTodosCreateTodosFormProps {
  editingTableId?: string | null;
  invitingTableId?: string | null;
  onClose?: () => void;
}

export default function CoopTodosCreateTodosForm({
  editingTableId = null,
  invitingTableId = null,
  onClose,
}: CoopTodosCreateTodosFormProps = {}) {
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

  // Pobierz dane tabeli do edycji
  const { data: editingTableData } = useSharedTableById(editingTableId || "");

  // Formularz dla tworzenia/edycji tabeli
  const tableForm = useForm<CreateTableForm>({
    resolver: zodResolver(createTableSchema),
    defaultValues: {
      tableName: "",
      description: "",
    },
  });

  // Stan dla emaili (prostsze rozwiązanie)
  const [emails, setEmails] = useState<string[]>([""]);

  // Określ tryb działania i resetuj formularz
  const getMode = () => {
    if (invitingTableId) return "invite";
    if (editingTableId) return "edit";
    return "create";
  };

  const mode = getMode();

  // Konfiguruj modal gdy się otwiera z propsami
  useEffect(() => {
    if (isOpen && (invitingTableId || editingTableId)) {
      if (invitingTableId) {
        // Tryb zapraszania - od razu step 2
        setCurrentStep("invite-users");
        setCreatedTableId(invitingTableId);
        setEmails([""]);
      } else if (editingTableId && editingTableData) {
        // Tryb edycji - step 1 z danymi
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

  // Automatyczne otwieranie modala dla edycji/zapraszania
  useEffect(() => {
    if (editingTableId || invitingTableId) {
      setIsOpen(true);
    }
  }, [editingTableId, invitingTableId]);

  // Handler dla tworzenia/edycji tabeli
  const handleTableSubmit = async (data: CreateTableForm) => {
    try {
      if (mode === "edit") {
        // Edycja tabeli
        await updateSharedTableMutation({
          sharedTableId: editingTableId!,
          tableName: data.tableName.trim(),
          description: data.description?.trim() || undefined,
        });

        toast({
          title: "Sukces",
          description: "Tabela została zaktualizowana",
        });

        setIsOpen(false);
        onClose?.();
      } else {
        // Tworzenie nowej tabeli
        const tableId = await createSharedTableMutation({
          tableName: data.tableName.trim(),
          description: data.description?.trim() || undefined,
        });

        setCreatedTableId(tableId);
        setCurrentStep("invite-users");

        toast({
          title: "Sukces",
          description: "Tabela została utworzona pomyślnie",
        });
      }
    } catch (error) {
      toast({
        title: "Błąd",
        description:
          mode === "edit"
            ? "Nie udało się zaktualizować tabeli"
            : "Nie udało się utworzyć tabeli",
        variant: "destructive",
      });
    }
  };

  // Handler dla zaproszeń
  const handleInviteSubmit = async () => {
    const tableId = createdTableId || invitingTableId;
    if (!tableId) return;

    const validEmails = emails.filter((email) => email.trim());

    if (validEmails.length === 0) {
      toast({
        title: "Błąd",
        description: "Dodaj przynajmniej jeden email",
        variant: "destructive",
      });
      return;
    }

    try {
      // Wysyłaj zaproszenia równolegle
      await Promise.all(
        validEmails.map((email) =>
          inviteToSharedTableMutation({
            sharedTableId: tableId,
            inviteeEmail: email.trim(),
          })
        )
      );

      toast({
        title: "Sukces",
        description: `Wysłano ${validEmails.length} zaproszeń`,
      });

      // Reset emaili i zamknij modal
      setEmails([""]);
      setIsOpen(false);
      onClose?.();
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać zaproszeń",
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
          // Reset stanu przy zamykaniu
          setCurrentStep("create-table");
          setCreatedTableId(null);
          setEmails([""]);
          tableForm.reset({ tableName: "", description: "" });
          // WAŻNE: Wywołaj onClose żeby parent zresetował propsy
          onClose?.();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            // Resetuj stan przed otwarciem nowej tabeli
            setCurrentStep("create-table");
            setCreatedTableId(null);
            setEmails([""]);
            tableForm.reset({ tableName: "", description: "" });
            setIsOpen(true);
          }}
        >
          Stwórz wspólną listę zadań
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "create-table"
              ? mode === "edit"
                ? "Edytuj tabelę"
                : "Stwórz nową tabelę"
              : mode === "invite"
              ? "Wyślij zaproszenia"
              : "Zaproś użytkowników"}
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
                    <FormLabel>Nazwa tabeli *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="np. Projekt marketingowy"
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

              <FormField
                control={tableForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis (opcjonalnie)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Krótki opis tabeli..."
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

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isCreatingSharedTable || isUpdatingSharedTable}
                >
                  Anuluj
                </Button>
                {mode === "edit" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoToInviteUsers}
                    disabled={isCreatingSharedTable || isUpdatingSharedTable}
                  >
                    Dodaj zaproszenia
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isCreatingSharedTable || isUpdatingSharedTable}
                >
                  {mode === "edit"
                    ? isUpdatingSharedTable
                      ? "Aktualizowanie..."
                      : "Zaktualizuj"
                    : isCreatingSharedTable
                    ? "Tworzenie..."
                    : "Stwórz"}
                </Button>
              </div>
            </form>
          </Form>
        )}

        {currentStep === "invite-users" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Zaproś użytkowników (opcjonalnie)</Label>
              <p className="text-sm text-muted-foreground">
                {mode === "create"
                  ? "Możesz zaprosić użytkowników do współpracy nad tą tabelą"
                  : "Dodaj kolejnych użytkowników do współpracy"}
              </p>
            </div>

            {emails.map((email, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  type="email"
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
                    Usuń
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
              + Dodaj email
            </Button>

            <div className="flex justify-end space-x-2 pt-4">
              {mode === "create" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCurrentStep("create-table")}
                  disabled={isInvitingToSharedTable}
                >
                  Wstecz
                </Button>
              )}
              <Button
                onClick={handleInviteSubmit}
                disabled={isInvitingToSharedTable}
              >
                {isInvitingToSharedTable
                  ? "Wysyłanie..."
                  : "Wyślij zaproszenia"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
