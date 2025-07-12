// import { useTodoById } from '@/api/queries/todos/useTodoById';
// import LightboxImage from '@/components/shared/LightboxImage';
// import Loader from '@/components/shared/Loader';
// import { useAuth } from '@/contexts/AuthContext';
// import { convertTimestampToDate, dateCustomFormatting } from '@/lib/helpers';
// import { ROUTES } from '@/routes/constants';
// import { ChevronLeftCircle, CopyCheck, CopyX } from 'lucide-react';
// import { useState } from 'react';
// import { Link, useParams } from 'react-router-dom';

// const Todopage = () => {
//   const { id } = useParams();
//   const { selectedDate, currentUser } = useAuth();
//   const { isLoading, isError, todo } = useTodoById(
//     id as string,
//     selectedDate,
//     currentUser
//   );
//   const [openLightBoxImage, setOpenLightBoxImage] = useState(false);

//   const handleCloseLightbox = () => {
//     setOpenLightBoxImage(false);
//   };

//   if (isLoading || !todo) {
//     return <Loader />;
//   }
//   if (isError) {
//     return <h1>Item don't exist!</h1>;
//   }

//   const createAtDate = convertTimestampToDate(todo?.createdAt);
//   const updateAtDate =
//     todo.updatedAt && convertTimestampToDate(todo?.updatedAt);
//   const dataImgToLightBoxImage = [{ src: todo?.imageUrl as string }];

//   return (
//     <div className="flex flex-col gap-4">
//       <nav>
//         <Link to={ROUTES.home}>
//           <ChevronLeftCircle />
//         </Link>
//       </nav>
//       <div className="max-5xl w-full border border-slate-200 p-3 rounded-md shadow">
//         <div className="flex flex-col sm:flex-row  items-start sm:items-center justify-between mb-4">
//           <div className="text-sm text-slate-700">
//             <span>Create todo: </span>
//             <span className="font-semibold italic">
//               {dateCustomFormatting(createAtDate)}
//             </span>
//           </div>
//           <div className="text-sm text-slate-700">
//             <span>Current date todo: </span>
//             <span className="font-semibold italic">{selectedDate}</span>
//           </div>
//           {todo.updatedAt && (
//             <div className="text-sm text-slate-700">
//               <span>Last update todo: </span>
//               <span className="font-semibold italic">
//                 {dateCustomFormatting(updateAtDate)}
//               </span>
//             </div>
//           )}
//         </div>
//         <div className="flex flex-col gap-4">
//           <div className="text-sm text-slate-700 flex item-center gap-3">
//             <span>Todo status: </span>
//             <span>
//               {todo.isCompleted ? (
//                 <CopyCheck className="text-teal-400" />
//               ) : (
//                 <CopyX className="text-rose-400" />
//               )}
//             </span>
//           </div>
//           <div className="text-sm text-slate-700">
//             <span>Todo title: </span>
//             <span className="font-semibold italic">{todo.todo}</span>
//           </div>
//           {todo.todoMoreContent && (
//             <div className="text-sm text-slate-700">
//               <span>Todo more content: </span>
//               <span className="font-semibold italic">
//                 {todo.todoMoreContent}
//               </span>
//             </div>
//           )}
//           <div className="mx-auto">
//             {todo.imageUrl && (
//               <img
//                 src={todo.imageUrl as string}
//                 alt={todo.todo}
//                 onClick={() => setOpenLightBoxImage(true)}
//                 className="block cursor-zoom-in"
//               />
//             )}
//             {todo.imageUrl && (
//               <LightboxImage
//                 open={openLightBoxImage}
//                 onClose={handleCloseLightbox}
//                 slides={dataImgToLightBoxImage}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Todopage;
