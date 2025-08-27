import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Info } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CooperativeListIcon } from "../Icons";
import { useTranslation } from "react-i18next";
import {
  useMySharedTables,
  useMyPendingInvitations,
} from "@/api/queries/coopTodos/useCoopTodos";
import CoopTodosCreateTodosForm from "./CoopTodosCreateTodosForm";
import { useAuth } from "@/contexts/AuthContext";
import { getInvitationStatus } from "@/lib/helpers";

import CoopTodosPending from "./CoopTodosPending";
import CoopTodosSent from "./CoopTodosSent";
import CoopTodosRecived from "./CoopTodosRecived";
import CoopTodosBadge from "./CoopTodosBadge";
import CoopListTodosWithActions from "./CoopListTodosWithActions";
import { useViewportKeyboard } from "@/hooks/useViewportKeyboard";

export default function CoopTodos() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState("coop-todos-list");
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [invitingTableId, setInvitingTableId] = useState<string | null>(null);

  const keyboardHeight = useViewportKeyboard(inputRef);

  const { data: sharedTables } = useMySharedTables();
  const { data: pendingInvitations } = useMyPendingInvitations();

  const hasPendingInvitations =
    pendingInvitations &&
    currentUser &&
    pendingInvitations.filter((inv) => {
      const actualStatus = getInvitationStatus(inv.status, inv.expires_at);
      return (
        actualStatus === "pending" && inv.invitee_email === currentUser.email
      );
    }).length > 0;

  useEffect(() => {
    if (hasPendingInvitations) {
      setActiveTab("invitations");
    } else {
      setActiveTab("coop-todos-list");
    }
  }, [hasPendingInvitations]);

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div
          className="cursor-pointer relative"
          data-testid="coop-todos-trigger"
        >
          <CooperativeListIcon size={30} />
          <CoopTodosBadge badgeAbsolutePosition />
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
          {/* Header with title and info icon */}
          <DrawerHeader className="absolute top-0 left-0 right-0 pb-4 bg-stone-50 z-10">
            <div className="flex items-center justify-between">
              <DrawerTitle className="text-lg font-semibold">
                {t("coopTodos.title")} ({sharedTables?.length || 0})
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
                      {t("coopTodos.description")}
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <DrawerDescription className="sr-only">
              {t("coopTodos.description")}
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable content area with calculated height */}
          <div
            className="pl-2 overflow-hidden"
            style={{
              height: `calc(90svh - 7.8125rem - ${keyboardHeight}px)` /* 125px for header (no form in CoopTodos) */,
              marginTop: "5rem" /* space for header */,
            }}
          >
            <div className="h-full overflow-y-auto custom-scrollbar">
              <div className="space-y-4">
                <CoopTodosCreateTodosForm
                  editingTableId={editingTableId}
                  invitingTableId={invitingTableId}
                  onClose={() => {
                    setEditingTableId(null);
                    setInvitingTableId(null);
                  }}
                />

                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="coop-todos-list">
                      {t("coopTodos.listsOfTasks")}
                    </TabsTrigger>
                    <TabsTrigger value="invitations" className="relative">
                      {t("coopTodos.invitations")}
                      <CoopTodosBadge />
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent
                    value="coop-todos-list"
                    className="space-y-4 mt-4"
                  >
                    <CoopListTodosWithActions
                      setEditingTableId={setEditingTableId}
                      setInvitingTableId={setInvitingTableId}
                    />
                  </TabsContent>

                  <TabsContent value="invitations" className="space-y-4 mt-4">
                    <Tabs defaultValue="pending" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="pending">
                          {t("coopTodos.pendingTab")}
                          {pendingInvitations &&
                            currentUser &&
                            pendingInvitations.filter(
                              (inv) => inv.invitee_email === currentUser.email
                            ).length > 0 && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-red-500 text-white text-xs px-1.5 py-0.5">
                                {
                                  pendingInvitations.filter(
                                    (inv) =>
                                      inv.invitee_email === currentUser.email
                                  ).length
                                }
                              </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="sent">
                          {t("coopTodos.sent")}
                        </TabsTrigger>
                        <TabsTrigger value="received">
                          {t("coopTodos.received")}
                        </TabsTrigger>
                      </TabsList>

                      {!currentUser ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {t("app.loading")}
                        </div>
                      ) : (
                        <>
                          {/* Otrzymane zaproszenia */}
                          <TabsContent
                            value="pending"
                            className="space-y-3 mt-4"
                          >
                            <CoopTodosPending />
                          </TabsContent>

                          {/* Wysłane zaproszenia */}
                          <TabsContent value="sent" className="space-y-3 mt-4">
                            <CoopTodosSent />
                          </TabsContent>

                          {/* Historia otrzymanych zaproszeń */}
                          <TabsContent
                            value="received"
                            className="space-y-3 mt-4"
                          >
                            <CoopTodosRecived />
                          </TabsContent>
                        </>
                      )}
                    </Tabs>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
