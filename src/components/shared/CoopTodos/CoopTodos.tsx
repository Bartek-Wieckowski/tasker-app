import { useState, useRef, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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

export default function CoopTodos() {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const formContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeTab, setActiveTab] = useState("coop-todos-list");
  const [editingTableId, setEditingTableId] = useState<string | null>(null);
  const [invitingTableId, setInvitingTableId] = useState<string | null>(null);

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

  useEffect(() => {
    const handleResize = () => {
      if (formContainerRef.current) {
        formContainerRef.current.style.setProperty(
          "bottom",
          `env(safe-area-inset-bottom)`
        );
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleResize);
      handleResize();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleResize);
      }
    };
  }, []);

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
      <DrawerContent ref={formContainerRef} className="min-h-[90vh] ">
        <div className="mx-auto w-full max-w-sm py-3">
          <div className="mb-6">
            <DrawerHeader className="mb-4 text-lg font-semibold">
              <DrawerTitle>
                {t("coopTodos.title")} ({sharedTables?.length || 0})
              </DrawerTitle>
              <DrawerDescription>
                {t("coopTodos.description")}
              </DrawerDescription>
            </DrawerHeader>

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

                <TabsContent value="coop-todos-list" className="space-y-4 mt-4">
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
                        <TabsContent value="pending" className="space-y-3 mt-4">
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
      </DrawerContent>
    </Drawer>
  );
}
