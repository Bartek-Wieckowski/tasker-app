// import { useEffect, useMemo, useState } from 'react';
// import { Tabs } from '@/components/ui/tabs';
// import { Input } from '@/components/ui/input';
// import { useTodosByDate } from '@/api/queries/todos/useTodosByDate';
// import { useAuth } from '@/contexts/AuthContext';
// import { TABS_TEXT_1, TABS_TEXT_2, TABS_TEXT_3 } from '@/lib/constants';
// import Loader from '../Loader';
// import TodosTabsList from './TodosTabsList';
// import TodosGlobalSearch from './TodosGlobalSearch';
// import TodosSearchToggler from './TodosSearchToggler';
// import TodosResultsTab from './TodosResultsTab';
// import TodosResultsGlobally from './TodosResultsGlobally';
// import { useGlobalSearch } from '@/contexts/GlobalSearchContext';

// const TodosTabs = () => {
//   const [categoryTab, setCategoryTab] = useState(TABS_TEXT_1);
//   const [searchValue, setSearchValue] = useState('');
//   const { selectedDate, currentUser } = useAuth();
//   const { isLoading, todos } = useTodosByDate(selectedDate, currentUser);
//   const {
//     isGlobalSearch,
//     setIsGlobalSearch,
//     globalSearchResult,
//     setGlobalSearchResult,
//     setSearchValueGlobal,
//   } = useGlobalSearch();

//   useEffect(() => {
//     setSearchValue('');
//   }, [selectedDate]);

//   useEffect(() => {
//     if (isGlobalSearch) {
//       setSearchValue('');
//     }
//   }, [isGlobalSearch]);

//   const todosChecked = todos?.filter((todo) => todo.isCompleted === true);
//   const todosNotChecked = todos?.filter((todo) => todo.isCompleted !== true);

//   const filteredTodos = useMemo(() => {
//     if (categoryTab === TABS_TEXT_1) {
//       if (!searchValue) return todos;
//       return todos?.filter((todo) =>
//         todo.todo.toLowerCase().includes(searchValue.toLowerCase())
//       );
//     }
//     if (categoryTab === TABS_TEXT_2) {
//       if (!searchValue) return todosChecked;
//       return todosChecked?.filter((todo) =>
//         todo.todo.toLowerCase().includes(searchValue.toLowerCase())
//       );
//     }
//     if (categoryTab === TABS_TEXT_3) {
//       if (!searchValue) return todosNotChecked;
//       return todosNotChecked?.filter((todo) =>
//         todo.todo.toLowerCase().includes(searchValue.toLowerCase())
//       );
//     }
//   }, [searchValue, categoryTab, todos, todosChecked, todosNotChecked]);

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchValue(event.target.value);
//   };

//   const categorySetHandler = (value: string) => {
//     setCategoryTab(value);
//   };

//   const toggleGlobalSearch = () => {
//     setIsGlobalSearch((prevState) => !prevState);
//     setGlobalSearchResult([]);
//     setSearchValueGlobal('');
//   };

//   if (isLoading || !todos || !filteredTodos) {
//     return <Loader />;
//   }

//   return (
//     <Tabs defaultValue={TABS_TEXT_1} className="w-full">
//       {!isGlobalSearch && (
//         <TodosTabsList categorySetHandler={categorySetHandler} />
//       )}
//       <TodosSearchToggler
//         isGlobalSearch={isGlobalSearch}
//         toggleGlobalSearch={toggleGlobalSearch}
//       />

//       {!isGlobalSearch ? (
//         todos?.length === 0 ? (
//           <p>Add your first task!</p>
//         ) : (
//           <Input
//             type="text"
//             placeholder="Search for a task on a selected day :)"
//             className="my-2"
//             onChange={handleChange}
//           />
//         )
//       ) : (
//         <TodosGlobalSearch
//           isGlobalSearch={isGlobalSearch}
//           currentUser={currentUser}
//         />
//       )}
//       {!isGlobalSearch ? (
//         <>
//           <TodosResultsTab todos={filteredTodos} tabValue={TABS_TEXT_1} />
//           <TodosResultsTab todos={filteredTodos} tabValue={TABS_TEXT_2} />
//           <TodosResultsTab todos={filteredTodos} tabValue={TABS_TEXT_3} />
//         </>
//       ) : (
//         <TodosResultsGlobally todos={globalSearchResult} />
//       )}
//       {!isGlobalSearch &&
//         filteredTodos &&
//         filteredTodos.length === 0 &&
//         searchValue !== '' && (
//           <p className="text-rose-400">
//             The task you searched for is not on the list.
//           </p>
//         )}
//     </Tabs>
//   );
// };

// export default TodosTabs;
