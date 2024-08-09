import { useEffect, useState } from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { List, ListChecks, ListX } from 'lucide-react';
import { TABS_TEXT_1, TABS_TEXT_2, TABS_TEXT_3 } from '@/lib/constants';

type TodosTabsListProps = {
  categorySetHandler: (value: string) => void;
};

const TodosTabsList = ({ categorySetHandler }: TodosTabsListProps) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 574) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <TabsList className="grid w-full grid-cols-3">
      <TabsTrigger value={TABS_TEXT_1} onClick={() => categorySetHandler(TABS_TEXT_1)}>
        {isMobile ? <List data-testid="icon-list" /> : TABS_TEXT_1}
      </TabsTrigger>
      <TabsTrigger value={TABS_TEXT_2} onClick={() => categorySetHandler(TABS_TEXT_2)}>
        {isMobile ? <ListChecks data-testid="icon-list-checks" /> : TABS_TEXT_2}
      </TabsTrigger>
      <TabsTrigger value={TABS_TEXT_3} onClick={() => categorySetHandler(TABS_TEXT_3)}>
        {isMobile ? <ListX data-testid="icon-list-x" /> : TABS_TEXT_3}
      </TabsTrigger>
    </TabsList>
  );
};

export default TodosTabsList;
