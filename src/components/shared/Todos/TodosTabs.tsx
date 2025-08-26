import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs } from "@/components/ui/tabs";
import { useTodosByDate } from "@/api/queries/todos/useTodosByDate";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "../Loader";
import TodosTabsList from "./TodosTabsList";
import TodosGlobalSearch from "./TodosGlobalSearch";
import TodosSearchToggler from "./TodosSearchToggler";
import { useGlobalSearch } from "@/contexts/GlobalSearchContext";
import TodosResultsTab from "./TodosResultsTab";
import { Input } from "@/components/ui/input";
import TodosResultsGlobally from "./TodosResultsGlobally";
import { useTranslation } from "react-i18next";
import { TodoRow } from "@/types/types";
import { useMobileTabGlobal } from "@/hooks/useMobileTabSync";

export default function TodosTabs() {
  const { t } = useTranslation();
  const [categoryTab, setCategoryTab] = useState("all");
  const { mobileActiveTab, setMobileActiveTab } = useMobileTabGlobal();
  const [searchValue, setSearchValue] = useState("");
  const { selectedDate, currentUser } = useAuth();
  const { todos, isLoading } = useTodosByDate(selectedDate, currentUser);
  const {
    isGlobalSearch,
    setIsGlobalSearch,
    setGlobalSearchResult,
    setSearchValueGlobal,
    globalSearchResult,
  } = useGlobalSearch();

  useEffect(() => {
    setSearchValue("");
  }, [selectedDate]);

  useEffect(() => {
    if (isGlobalSearch) {
      setSearchValue("");
    }
  }, [isGlobalSearch]);

  const todosChecked = todos.filter((todo) => todo.is_completed === true);
  const todosNotChecked = todos.filter((todo) => todo.is_completed !== true);

  const filteredTodos = useMemo(() => {
    if (categoryTab === "all") {
      if (!searchValue) return todos;
      return todos.filter((todo) =>
        todo.todo.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    if (categoryTab === "completed") {
      if (!searchValue) return todosChecked;
      return todosChecked.filter((todo) =>
        todo.todo.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    if (categoryTab === "notCompleted") {
      if (!searchValue) return todosNotChecked;
      return todosNotChecked.filter((todo) =>
        todo.todo.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
    return [];
  }, [searchValue, categoryTab, todos, todosChecked, todosNotChecked]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const categorySetHandler = (value: string) => {
    setCategoryTab(value);
    // Sync with mobile if needed
    if (window.innerWidth < 768) {
      setMobileActiveTab(value);
    }
  };

  // Listen to mobile tab changes
  useEffect(() => {
    setCategoryTab(mobileActiveTab);
  }, [mobileActiveTab]);

  const toggleGlobalSearch = () => {
    setIsGlobalSearch((prevState) => !prevState);
    setGlobalSearchResult([]);
    setSearchValueGlobal("");
  };

  if (isLoading || !todos || !filteredTodos) {
    return <Loader />;
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="all" className="w-full h-full flex flex-col">
        {/* Fixed controls section */}
        <div className="flex-shrink-0">
          {!isGlobalSearch && (
            <div className="hidden md:block">
              <TodosTabsList categorySetHandler={categorySetHandler} />
            </div>
          )}
          <TodosSearchToggler
            isGlobalSearch={isGlobalSearch}
            toggleGlobalSearch={toggleGlobalSearch}
          />

          {!isGlobalSearch ? (
            todos.length === 0 ? (
              <p>{t("todosTabs.addFirstTask")}</p>
            ) : (
              <Input
                type="text"
                name="search"
                id="search"
                placeholder={t("todosTabs.searchPlaceholder")}
                className="my-2"
                onChange={handleChange}
              />
            )
          ) : (
            <TodosGlobalSearch
              isGlobalSearch={isGlobalSearch}
              currentUser={currentUser}
            />
          )}
        </div>

        {/* Scrollable content section with animations */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            {!isGlobalSearch ? (
              <motion.div
                key={`tabs-${categoryTab}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                {categoryTab === "all" && (
                  <TodosResultsTab todos={filteredTodos} />
                )}
                {categoryTab === "completed" && (
                  <TodosResultsTab todos={filteredTodos} />
                )}
                {categoryTab === "notCompleted" && (
                  <TodosResultsTab todos={filteredTodos} />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="global-search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full"
              >
                <TodosResultsGlobally
                  todos={globalSearchResult as unknown as TodoRow[]}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {!isGlobalSearch &&
            filteredTodos &&
            filteredTodos.length === 0 &&
            searchValue !== "" && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="text-rose-400"
              >
                {t("todosTabs.noResults")}
              </motion.p>
            )}
        </div>
      </Tabs>
    </div>
  );
}
