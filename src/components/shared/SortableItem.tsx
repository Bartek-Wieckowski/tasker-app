import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ReactElement } from "react";

type SortableItemProps<T> = {
  data: T;
  isUpdating?: boolean;
  renderItem: (props: { data: T; disableMargin?: boolean }) => ReactElement;
  id: string; // ID for sorting
};

export default function SortableItem<T>({
  data,
  isUpdating = false,
  renderItem: RenderComponent,
  id,
}: SortableItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group flex items-center gap-2",
        isDragging && "z-50",
        isUpdating && "pointer-events-none opacity-60"
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100 transition-opacity duration-200 p-2 hover:bg-gray-50 rounded-md border border-transparent hover:border-gray-200"
        title="Przeciągnij aby zmienić kolejność"
      >
        <ArrowUpDown className="w-5 h-5 text-gray-400" />
      </div>

      {/* Item Content */}
      <div className="flex-1 mb-3">
        <RenderComponent data={data} disableMargin={true} />
      </div>
    </div>
  );
}
