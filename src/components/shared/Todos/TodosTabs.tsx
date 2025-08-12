import { useEffect, useMemo, useState } from "react";
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

const TodosTabs = () => {
  const { t } = useTranslation();
  const [categoryTab, setCategoryTab] = useState("all");
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
  }, [searchValue, categoryTab, todos, todosChecked, todosNotChecked]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  const categorySetHandler = (value: string) => {
    setCategoryTab(value);
  };

  const toggleGlobalSearch = () => {
    setIsGlobalSearch((prevState) => !prevState);
    setGlobalSearchResult([]);
    setSearchValueGlobal("");
  };

  if (isLoading || !todos || !filteredTodos) {
    return <Loader />;
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      {!isGlobalSearch && (
        <TodosTabsList categorySetHandler={categorySetHandler} />
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

      {!isGlobalSearch ? (
        <>
          <TodosResultsTab todos={filteredTodos} tabValue="all" />
          <TodosResultsTab todos={filteredTodos} tabValue="completed" />
          <TodosResultsTab todos={filteredTodos} tabValue="notCompleted" />
        </>
      ) : (
        <TodosResultsGlobally
          todos={globalSearchResult as unknown as TodoRow[]}
        />
      )}
      {!isGlobalSearch &&
        filteredTodos &&
        filteredTodos.length === 0 &&
        searchValue !== "" && (
          <p className="text-rose-400">{t("todosTabs.noResults")}</p>
        )}
    </Tabs>
  );
};

export default TodosTabs;
