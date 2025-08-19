import { Database, TablesInsert } from "./supabase";

export type NewUser = {
  username: string;
  email: string;
  password: string;
};
export type User = {
  accountId: string;
  username: string;
  email: string;
  imageUrl: string;
  providerId?: string;
};
export type LoginUser = {
  email: string;
  password: string;
};
export type AuthContextType = {
  currentUser: User;
  setCurrentUser: React.Dispatch<React.SetStateAction<User>>;
  isLoading: boolean;
  isAuth: boolean;
  selectedDate: string;
  setSelectedDate: React.Dispatch<React.SetStateAction<string>>;
};
export type UpdateUser = {
  username: string;
  email: string;
  imageUrl?: File;
};
export type UserProfileUpdates = {
  displayName?: string;
  photoURL?: string;
};
export type UpdateUserPassword = {
  password: string;
};

export type TodoRow = Database["public"]["Tables"]["todos"]["Row"];
export type TodoInsert = Database["public"]["Tables"]["todos"]["Insert"];
export type TodoUpdate = Database["public"]["Tables"]["todos"]["Update"];

export type TodoInsertWithFile = TablesInsert<"todos"> & {
  imageFile?: File;
};

export type TodoSearchResult = {
  like: TodoRow;
};

export type TodoUpdateDetails = {
  todo?: string;
  todo_more_content?: string | null;
  imageFile?: File | null;
  deleteImage?: boolean;
};

export type DelegatedTodoRow =
  Database["public"]["Tables"]["delegated_todos"]["Row"];
export type DelegatedTodoInsert =
  Database["public"]["Tables"]["delegated_todos"]["Insert"];
export type DelegatedTodoUpdate =
  Database["public"]["Tables"]["delegated_todos"]["Update"];

export type GlobalTodoRow = Database["public"]["Tables"]["global_todos"]["Row"];
export type GlobalTodoInsert =
  Database["public"]["Tables"]["global_todos"]["Insert"];
export type GlobalTodoUpdate =
  Database["public"]["Tables"]["global_todos"]["Update"];

export type CyclicTodoRow = Database["public"]["Tables"]["cyclic_todos"]["Row"];
export type CyclicTodoInsert =
  Database["public"]["Tables"]["cyclic_todos"]["Insert"];
export type CyclicTodoUpdate =
  Database["public"]["Tables"]["cyclic_todos"]["Update"];

export type SearchGlobalContextType = {
  searchValueGlobal: string;
  setSearchValueGlobal: React.Dispatch<React.SetStateAction<string>>;
  isGlobalSearch: boolean;
  setIsGlobalSearch: React.Dispatch<React.SetStateAction<boolean>>;
  globalSearchResult: TodoSearchResult[];
  setGlobalSearchResult: React.Dispatch<
    React.SetStateAction<TodoSearchResult[]>
  >;
};
