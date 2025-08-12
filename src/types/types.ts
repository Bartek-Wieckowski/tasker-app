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

export type TodoRow = Database["public"]["Tables"]["todos"]["Row"]; // reprezentacja rekordu w bazie
export type TodoInsert = Database["public"]["Tables"]["todos"]["Insert"]; // struktura potrzebna do insert
export type TodoUpdate = Database["public"]["Tables"]["todos"]["Update"];

export type TodoInsertWithFile = TablesInsert<"todos"> & {
  imageFile?: File; // pole tymczasowe, nie ma go w bazie
};

export type TodoSearchResult = {
  like: TodoRow;
};

// Typ dla danych z bazy danych (po pobraniu)
export type TodoFromDatabase = {
  id: string;
  todo: string;
  todo_more_content: string | null;
  image_url: string | null; // W bazie to string | null
  user_id: string;
  todo_date: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  original_todo_id: string | null;
  is_independent_edit: boolean | null;
  from_delegated: boolean | null;
};

// Typ dla danych w formularzu (przed wysłaniem)
export type TodoForForm = {
  todo: string;
  todo_more_content?: string;
  imageFile?: File; // Tylko w formularzu
  user_id: string;
  todo_date: string;
  is_completed: boolean;
};

// export type TodoItem = {
//   todo: string;
//   todoMoreContent?: string;
//   imageUrl?: File;
// };

// Typ bazowy dla kompatybilności wstecznej - używaj TodoFromDatabase zamiast tego
export type TodoItemBase = {
  todo: string;
  todoMoreContent?: string;
  imageUrl: string | null; // Zmienione na string | null dla kompatybilności z bazą
  id: string;
  isCompleted: boolean;
  createdAt: Date | { seconds: number; nanoseconds: number };
  updatedAt?: Date | { seconds: number; nanoseconds: number };
  originalTodoId?: string;
  isIndependentEdit?: boolean;
  fromDelegated?: boolean;
};

export type TodoItemDetails = TodoItemBase;
export type TodoItemDetailsGlobalSearch = TodoItemBase & {
  todoDate?: string;
  todoSearchValue?: string;
};
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
