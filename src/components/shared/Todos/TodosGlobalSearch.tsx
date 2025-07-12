// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { searchInDatabase } from '@/api/apiTodos';
// import { User } from '@/types/types';
// import { Search } from 'lucide-react';
// import { useGlobalSearch } from '@/contexts/GlobalSearchContext';
// import { useState } from 'react';

// type TodosGlobalSearchProps = {
//   isGlobalSearch: boolean;
//   currentUser: User;
// };

// const TodosGlobalSearch = ({ isGlobalSearch, currentUser }: TodosGlobalSearchProps) => {
//   const [errorMessage, setErrorMessage] = useState('');
//   const { searchValueGlobal, setSearchValueGlobal, setGlobalSearchResult } = useGlobalSearch();

//   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchValueGlobal(event.target.value);
//   };

//   const handleSearch = async () => {
//     if (isGlobalSearch) {
//       try {
//         const searchResults = await searchInDatabase(searchValueGlobal, currentUser);
//         setGlobalSearchResult(searchResults);

//         if (searchResults.length === 0) {
//           setErrorMessage('No results found');
//         } else {
//           setErrorMessage('');
//         }
//       } catch (error) {
//         console.error('Error searching in database:', error);
//       }
//     }
//   };

//   const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
//     if (event.key === 'Enter') {
//       handleSearch();
//     }
//   };

//   return (
//     <>
//       <div className="flex items-center gap-2">
//         <Input type="text" placeholder="Serach task and press button" className="my-2" onChange={handleChange} onKeyDown={handleKeyPress} />
//         <Button onClick={handleSearch}>
//           <Search className="w-[15px] h-[15px]" />
//         </Button>
//       </div>
//       {errorMessage && <p className="text-rose-400">Nothing of this value was found</p>}
//     </>
//   );
// };

// export default TodosGlobalSearch;
