import { useEffect, useState } from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { List, ListChecks, ListX } from "lucide-react";
import { useTranslation } from "react-i18next";

type TodosTabsListProps = {
  categorySetHandler: (value: string) => void;
};

export default function TodosTabsList({
  categorySetHandler,
}: TodosTabsListProps) {
  const [isMobile, setIsMobile] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 574) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <TabsList className="grid w-full grid-cols-3 ">
      <TabsTrigger value="all" onClick={() => categorySetHandler("all")}>
        {isMobile ? (
          <List className="" data-testid="icon-list" />
        ) : (
          t("todosTabs.all")
        )}
      </TabsTrigger>
      <TabsTrigger
        value="completed"
        onClick={() => categorySetHandler("completed")}
      >
        {isMobile ? (
          <ListChecks data-testid="icon-list-checks" />
        ) : (
          t("todosTabs.completed")
        )}
      </TabsTrigger>
      <TabsTrigger
        value="notCompleted"
        onClick={() => categorySetHandler("notCompleted")}
      >
        {isMobile ? (
          <ListX data-testid="icon-list-x" />
        ) : (
          t("todosTabs.notCompleted")
        )}
      </TabsTrigger>
    </TabsList>
  );
}
