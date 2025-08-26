import { motion, AnimatePresence } from "framer-motion";
import TodosItemCard from "./TodosItemCard";
import { TodoRow } from "@/types/types";

type TodosResultsGloballyProps = {
  todos: TodoRow[];
};

export default function TodosResultsGlobally({
  todos,
}: TodosResultsGloballyProps) {
  return (
    <div className="max-h-[calc(100vh-290px)] md:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
      <AnimatePresence mode="wait">
        {todos.map((data, index) => (
          <motion.div
            key={data.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: "easeInOut",
              delay: index * 0.05, // Staggered animation for each item
            }}
          >
            <TodosItemCard data={data} isGlobalSearch={true} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
