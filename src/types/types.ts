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
  imageUrl: File;
};
export type UpdateUserPassword = {
  password: string;
};
export type TodoItem = {
  todo: string;
  todoMoreContent?: string;
  imageUrl?: File;
};
export type TodoItemDetails = {
  todo: string;
  todoMoreContent?: string;
  imageUrl: string | File;
  id: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
