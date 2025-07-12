// import { useState, useRef, useEffect } from 'react';
// import { Button } from '@/components/ui/button';
// import {
//   Drawer,
//   DrawerContent,
//   DrawerDescription,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from '@/components/ui/drawer';
// import { ListEnd, EllipsisVertical } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { useAuth } from '@/contexts/AuthContext';
// import { TodoItemBase } from '@/types/types';
// import { Calendar } from '@/components/ui/calendar';
// import {
//   Dialog,
//   DialogContent,
//   DialogTitle,
//   DialogHeader,
//   DialogDescription,
// } from '@/components/ui/dialog';
// import Loader from '@/components/shared/Loader';
// import { useGlobalTodos } from '@/api/queries/globalTodos/useGlobalTodos';
// import { useAddGlobalTodo } from '@/api/mutations/globalTodos/useAddGlobalTodo';
// import { useAssignGlobalTodo } from '@/api/mutations/globalTodos/useAssignGlobalTodo';
// import { useEditGlobalTodo } from '@/api/mutations/globalTodos/useEditGlobalTodo';
// import { useDeleteGlobalTodo } from '@/api/mutations/globalTodos/useDeleteGlobalTodo';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import { GlobalTodoForm } from './GlobalTodoForm';
// import { UseFormReturn } from "react-hook-form";

// export default function GlobalTodos() {
//   const formContainerRef = useRef<HTMLDivElement | null>(null);
//   const [selectedTodo, setSelectedTodo] = useState<TodoItemBase | null>(null);
//   const [isDialogOpen, setIsDialogOpen] = useState(false);
//   const [editDialogOpen, setEditDialogOpen] = useState(false);
//   const [todoToEdit, setTodoToEdit] = useState<TodoItemBase | null>(null);
//   const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
//   const { currentUser } = useAuth();
//   const { globalTodos, isLoading } = useGlobalTodos(
//     currentUser?.accountId || ''
//   );
//   const { createGlobalTodo, isCreatingGlobalTodo } = useAddGlobalTodo(
//     currentUser?.accountId || ''
//   );
//   const { assignGlobalTodo, isAssigningGlobalTodo } = useAssignGlobalTodo(
//     currentUser?.accountId || ''
//   );
//   const { editGlobalTodoItem, isEditingGlobalTodo } = useEditGlobalTodo(
//     currentUser?.accountId || ''
//   );
//   const { deleteGlobalTodo, isDeletingGlobalTodo } = useDeleteGlobalTodo(
//     currentUser?.accountId || ''
//   );

//   useEffect(() => {
//     const handleResize = () => {
//       if (formContainerRef.current) {
//         formContainerRef.current.style.setProperty('bottom', `env(safe-area-inset-bottom)`);
//       }
//     };

//     if (window.visualViewport) {
//       window.visualViewport.addEventListener("resize", handleResize);
//       handleResize();
//     }

//     return () => {
//       if (window.visualViewport) {
//         window.visualViewport.removeEventListener("resize", handleResize);
//       }
//     };
//   }, []);

//   const handleAddSubmit = (data: { todo: string }, form: UseFormReturn<{ todo: string }>) => {
//     createGlobalTodo(data.todo, {
//       onSuccess: () => {
//         form.reset();
//       },
//     });
//   };

//   const handleEditSubmit = (data: { todo: string }) => {
//     if (todoToEdit) {
//       editGlobalTodoItem(
//         {
//           todoId: todoToEdit.id,
//           newTodoName: data.todo,
//         },
//         {
//           onSuccess: () => {
//             setEditDialogOpen(false);
//             setTodoToEdit(null);
//           },
//         }
//       );
//     }
//   };

//   const handleDateSelect = (date: Date | undefined) => {
//     if (!date || !selectedTodo) return;

//     setSelectedDate(date);
//     assignGlobalTodo(
//       {
//         todoId: selectedTodo.id,
//         date,
//       },
//       {
//         onSuccess: () => {
//           setSelectedTodo(null);
//           setIsDialogOpen(false);
//           setSelectedDate(undefined);
//         },
//       }
//     );
//   };

//   return (
//     <Drawer>
//       <DrawerTrigger asChild>
//         <ListEnd
//           className="cursor-pointer"
//           data-testid="global-todos-trigger"
//         />
//       </DrawerTrigger>
//       <DrawerContent ref={formContainerRef} className="min-h-[70vh]">
//         <div className="mx-auto w-full max-w-sm py-3">
//           <div className="mb-6">
//             <DrawerHeader className="mb-4 text-lg font-semibold">
//               <DrawerTitle>
//                 Global Tasks ({globalTodos?.length || 0})
//               </DrawerTitle>
//               <DrawerDescription>
//                 Add tasks to a global list that you can assign a specific date
//                 to a task when you need it
//               </DrawerDescription>
//             </DrawerHeader>

//             <div className="space-y-2 h-[50vh] overflow-auto custom-scrollbar">
//               {isLoading ? (
//                 <Loader />
//               ) : (
//                 globalTodos?.map((todo: TodoItemBase) => (
//                   <div
//                     key={todo.id}
//                     className="flex items-center justify-between rounded-lg border p-3"
//                   >
//                     <span>{todo.todo}</span>
//                     <DropdownMenu>
//                       <DropdownMenuTrigger asChild>
//                         <EllipsisVertical className="cursor-pointer" />
//                       </DropdownMenuTrigger>
//                       <DropdownMenuContent className="z-50" side="left" align="start">
//                         <div className="flex flex-col gap-2 p-2">
//                           <Button
//                             onClick={() => {
//                               setSelectedTodo(todo);
//                               setIsDialogOpen(true);
//                             }}
//                           >
//                             Assign to day
//                           </Button>
//                           <Button
//                             variant="outline"
//                             onClick={() => {
//                               setTodoToEdit(todo);
//                               setEditDialogOpen(true);
//                             }}
//                           >
//                             Edit
//                           </Button>
//                           <Button
//                             variant="destructive"
//                             onClick={() => deleteGlobalTodo(todo.id)}
//                             disabled={isDeletingGlobalTodo}
//                           >
//                             {isDeletingGlobalTodo ? (
//                               <div className="flex gap-2">
//                                 <Loader />
//                                 Deleting...
//                               </div>
//                             ) : (
//                               'Delete'
//                             )}
//                           </Button>
//                         </div>
//                       </DropdownMenuContent>
//                     </DropdownMenu>
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           <Dialog
//             open={isDialogOpen}
//             onOpenChange={(open) => {
//               if (!open) {
//                 setTimeout(() => {
//                   setSelectedTodo(null);
//                   setSelectedDate(undefined);
//                 }, 0);
//               }
//               setIsDialogOpen(open);
//             }}
//           >
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Assign task to a day</DialogTitle>
//                 <DialogDescription>
//                   Pick a date to assign this task
//                 </DialogDescription>
//               </DialogHeader>
//               <div className="flex justify-center p-4">
//                 <Calendar
//                   mode="single"
//                   selected={selectedDate}
//                   onSelect={(date) => {
//                     if (date) {
//                       handleDateSelect(date);
//                     }
//                   }}
//                   initialFocus={false}
//                   className="rounded-md border"
//                 />
//               </div>
//               {isAssigningGlobalTodo && (
//                 <div className="flex justify-center">
//                   <Loader />
//                 </div>
//               )}
//             </DialogContent>
//           </Dialog>

//           <Dialog
//             open={editDialogOpen}
//             onOpenChange={(open) => {
//               if (!open) {
//                 setTimeout(() => {
//                   setTodoToEdit(null);
//                 }, 0);
//               }
//               setEditDialogOpen(open);
//             }}
//           >
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Edit Todo</DialogTitle>
//                 <DialogDescription/>
//               </DialogHeader>
//               {todoToEdit && (
//                 <GlobalTodoForm
//                   type="edit"
//                   onSubmit={handleEditSubmit}
//                   isLoading={isEditingGlobalTodo}
//                   defaultValues={{
//                     todo: todoToEdit.todo
//                   }}
//                 />
//               )}
//             </DialogContent>
//           </Dialog>

//           <div className={cn('grid items-start gap-4 px-4')}>
//             <GlobalTodoForm
//               type="add"
//               onSubmit={handleAddSubmit}
//               isLoading={isCreatingGlobalTodo}
//             />
//           </div>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// }
