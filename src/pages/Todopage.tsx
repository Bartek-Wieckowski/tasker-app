import { useTodoById } from "@/api/queries/todos/useTodoById";
import LightboxImage from "@/components/shared/LightboxImage";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { convertTimestampToDate, dateCustomFormatting } from "@/lib/helpers";
import { ROUTES } from "@/routes/constants";
import { ChevronLeftCircle, CopyCheck, CopyX } from "lucide-react";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Todopage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const { selectedDate, currentUser } = useAuth();
  const { isLoading, isError, todo } = useTodoById(id as string, currentUser);
  const [openLightBoxImage, setOpenLightBoxImage] = useState(false);

  const handleCloseLightbox = () => {
    setOpenLightBoxImage(false);
  };

  if (isLoading || !todo) {
    return <Loader />;
  }

  if (isError) {
    return <h1>{t("todopage.errorText")}</h1>;
  }

  const createAtDate = convertTimestampToDate(todo?.created_at);
  const updateAtDate = convertTimestampToDate(todo?.updated_at);
  const dataImgToLightBoxImage = [{ src: todo?.image_url as string }];

  return (
    <div className="flex flex-col gap-4">
      <nav>
        <Link to={ROUTES.home}>
          <ChevronLeftCircle />
        </Link>
      </nav>
      <div className="max-5xl w-full border border-slate-200 p-3 rounded-md shadow">
        <div className="flex flex-col sm:flex-row  items-start sm:items-center justify-between mb-4">
          <div className="text-sm text-slate-700">
            <span>{t("todopage.createTodo")}: </span>
            <span className="font-semibold italic">
              {dateCustomFormatting(createAtDate)}
            </span>
          </div>
          <div className="text-sm text-slate-700">
            <span>{t("todopage.currentTodoDate")}: </span>
            <span className="font-semibold italic">{selectedDate}</span>
          </div>

          {updateAtDate.getTime() !== createAtDate.getTime() && (
            <div className="text-sm text-slate-700">
              <span>{t("todopage.updateTodo")}: </span>
              <span className="font-semibold italic">
                {dateCustomFormatting(updateAtDate)}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-slate-700 flex item-center gap-3">
            <span>{t("todopage.todoStatus")}: </span>
            <span>
              {todo.is_completed ? (
                <CopyCheck className="text-teal-400" />
              ) : (
                <CopyX className="text-rose-400" />
              )}
            </span>
          </div>
          <div className="text-sm text-slate-700">
            <span>{t("todopage.todoTitle")}: </span>
            <span className="font-semibold italic">{todo.todo}</span>
          </div>
          {todo.todo_more_content && (
            <div className="text-sm text-slate-700">
              <span>{t("todopage.todoMoreContent")}: </span>
              <span className="font-semibold italic">
                {todo.todo_more_content}
              </span>
            </div>
          )}
          <div className="mx-auto">
            {todo.image_url && (
              <img
                src={todo.image_url as string}
                alt={todo.todo}
                onClick={() => setOpenLightBoxImage(true)}
                className="block cursor-zoom-in"
              />
            )}
            {todo.image_url && (
              <LightboxImage
                open={openLightBoxImage}
                onClose={handleCloseLightbox}
                slides={dataImgToLightBoxImage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Todopage;
