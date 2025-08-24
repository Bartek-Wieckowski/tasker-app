import { useQuery } from "@tanstack/react-query";
import {
  getMySharedTables,
  getMyAccessibleTodos,
  getCoopTodosByTableId,
  getSharedTableById,
  getMyPendingInvitations,
  getMySentInvitations,
  getMyReceivedInvitations,
} from "@/api/apiCoopTodos";
import { QUERY_KEYS } from "@/api/constants";

export function useMySharedTables() {
  return useQuery({
    queryKey: [QUERY_KEYS.coopTodosShared],
    queryFn: getMySharedTables,
  });
}

export function useMyAccessibleTodos() {
  return useQuery({
    queryKey: [QUERY_KEYS.coopTodos],
    queryFn: getMyAccessibleTodos,
  });
}

export function useCoopTodosByTableId(sharedTableId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.coopTodos, sharedTableId],
    queryFn: () => getCoopTodosByTableId(sharedTableId),
    enabled: !!sharedTableId,
  });
}

export function useSharedTableById(sharedTableId: string) {
  return useQuery({
    queryKey: [QUERY_KEYS.coopTodosShared, sharedTableId],
    queryFn: () => getSharedTableById(sharedTableId),
    enabled: !!sharedTableId,
  });
}

export function useMyPendingInvitations() {
  return useQuery({
    queryKey: [QUERY_KEYS.coopTodosInvitations, "pending"],
    queryFn: getMyPendingInvitations,
  });
}

export function useMySentInvitations() {
  return useQuery({
    queryKey: [QUERY_KEYS.coopTodosInvitations, "sent"],
    queryFn: getMySentInvitations,
  });
}

export function useMyReceivedInvitations() {
  return useQuery({
    queryKey: [QUERY_KEYS.coopTodosInvitations, "received"],
    queryFn: getMyReceivedInvitations,
  });
}
