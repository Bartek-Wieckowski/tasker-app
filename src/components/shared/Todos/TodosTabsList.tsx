import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";

type TodosTabsListProps = {
  categorySetHandler: (value: string) => void;
};

export default function TodosTabsList({
  categorySetHandler,
}: TodosTabsListProps) {
  const { t } = useTranslation();

  return (
    <TabsList className="grid w-full grid-cols-3 ">
      <TabsTrigger value="all" onClick={() => categorySetHandler("all")}>
        {t("todosTabs.all")}
      </TabsTrigger>
      <TabsTrigger
        value="completed"
        onClick={() => categorySetHandler("completed")}
      >
        {t("todosTabs.completed")}
      </TabsTrigger>
      <TabsTrigger
        value="notCompleted"
        onClick={() => categorySetHandler("notCompleted")}
      >
        {t("todosTabs.notCompleted")}
      </TabsTrigger>
    </TabsList>
  );
}
