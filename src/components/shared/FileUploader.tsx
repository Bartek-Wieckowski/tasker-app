import { useState } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { Button } from "../ui/button";
import { ImagePlus } from "lucide-react";
import { useTranslation } from "react-i18next";

type FileUploaderProps = {
  fieldChange: (file: File) => void;
  mediaUrl: string;
};

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [fileUrl, setFileUrl] = useState<string>(mediaUrl || "");
  const { t } = useTranslation();

  const onDrop = (acceptedFiles: FileWithPath[]) => {
    const file = acceptedFiles[0];
    fieldChange(file);
    setFileUrl(URL.createObjectURL(file));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg"],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className="flex flex-col items-center justify-center rounded-xl cursor-pointer"
    >
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrl ? (
        <>
          <div className="flex flex-1 justify-center w-full p-2 lg:p-10">
            <img
              src={fileUrl}
              alt="Uploaded Image"
              className="h-[30px] w-[30px] rounded-[24px]"
              data-testid="image-preview"
            />
          </div>
        </>
      ) : (
        <div className="flex justify-center items-center flex-col p-7 min-h-20">
          <ImagePlus width={96} height={77} />
          <h3 className="text-light-2 text-sm mb-2 mt-6">
            {t("fileUploader.dragPhotoHere")}
          </h3>
          <p className="text-light-4 text-sm mb-6">SVG, PNG, JPG</p>
          <Button type="button" variant="secondary">
            {t("fileUploader.selectFromComputer")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
