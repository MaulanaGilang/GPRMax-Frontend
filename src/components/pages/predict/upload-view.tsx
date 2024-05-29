import { FileWithMeta, PredictData } from "@/app/predict/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { fontKhand } from "@/themes/font";
import { Cross2Icon, PlusIcon } from "@radix-ui/react-icons";
import Image from "next/image";
import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

interface UploadViewProps {
  addImageFile: (droppedFiles: File[]) => void;
  onClickPredict: () => void;
  disabled?: boolean;
}

export default function UploadView({
  addImageFile,
  onClickPredict,
  disabled,
}: UploadViewProps) {
  const predictForm = useFormContext<PredictData>();
  const inputRef = useRef<HTMLInputElement>(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithMeta | null>(null);

  const files = predictForm.watch("files");

  const onDetectMethodChange = (value: string) => {
    predictForm.setValue("detectionMethod", value as "cnn" | "roboflow");
  };

  const onChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addImageFile(Array.from(event.target.files));
    }
  };

  return (
    <>
      <div className="flex flex-row items-center w-full max-h-full h-full">
        <div className="flex-1 max-h-[calc(100vh-4rem)] w-full overflow-y-auto relative">
          <div
            className={cn(
              "flex-1 w-full grid p-8 items-center justify-center",
              files?.length === 1 && "grid-cols-[repeat(auto-fit,_75%)]",
              files?.length === 2 &&
                "lg:grid-cols-2 md:grid-cols-2 sm:grid-rows-1",
              files?.length >= 3 &&
                "xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-2 sm:grid-rows-1"
            )}
          >
            {files?.map((file: FileWithMeta, index: number) => (
              <Card
                key={index}
                className={cn(
                  "m-4 relative hover:cursor-pointer",
                  files?.length >= 3 && "h-48 max-w-sm",
                  files?.length < 3 &&
                    "max-w-xl w-full max-h-[200px] xl:max-h-[300px] h-full",
                  files?.length === 1 &&
                    "max-w-4xl w-full max-h-[250px] xl:max-h-[500px] h-full"
                )}
                onClick={() => {
                  setOpenPreview(true);
                  setSelectedFile(file);
                }}
              >
                <div className="absolute top-0 left-0 w-full h-full opacity-0 bg-black hover:opacity-30 transition-opacity rounded-lg" />
                <div className="absolute top-2 right-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-white bg-black/20 backdrop-blur-sm hover:bg-red-500 hover:text-white"
                          disabled={disabled}
                          onClick={() => {
                            predictForm.setValue(
                              "files",
                              files?.filter((_, i) => i !== index)
                            );
                          }}
                        >
                          <Cross2Icon />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remove</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Image
                  src={file.url}
                  alt="uploaded file"
                  className="object-cover w-full h-full rounded-3xl"
                  width={160}
                  height={160}
                />
              </Card>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center max-w-xs lg:max-w-md w-full h-full bg-white/80 pt-8 pb-8 pl-10 pr-10">
          <h1
            className={cn(
              "text-4xl text-black font-bold mb-4 mt-6",
              fontKhand.className
            )}
          >
            Detect Airgap
          </h1>
          <p className="text-lg font-normal text-black mt-8 mb-8">
            Select the model to detect airgap in concrete
          </p>
          <Select
            onValueChange={onDetectMethodChange}
            defaultValue={predictForm.watch("detectionMethod")}
            disabled={disabled}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cnn">CNN</SelectItem>
              <SelectItem value="roboflow">Roboflow-CNN</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex flex-1 w-full justify-center items-end">
            <div className="flex flex-wrap gap-4 mb-12 w-full">
              <Button
                size="lg"
                className="bg-black text-white flex-1"
                disabled={disabled}
                onClick={() => {
                  inputRef.current?.click();
                }}
              >
                <PlusIcon />
                Add Image
              </Button>
              <input
                type="file"
                className="hidden"
                ref={inputRef}
                onChange={onChangeFile}
                multiple={true}
                accept="image/*"
              />
              <Button
                size="lg"
                className="bg-black text-white flex-1"
                disabled={disabled}
                onClick={onClickPredict}
              >
                Predict
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={openPreview} onOpenChange={setOpenPreview}>
        <DialogContent className="h-[95vh] min-w-[95%] flex flex-col">
          <DialogHeader className="max-h-2">
            <DialogTitle>Preview {selectedFile?.file.name}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            <Image
              src={selectedFile?.url || ""}
              alt="uploaded file"
              className="object-cover h-[95%] w-full"
              width={160}
              height={160}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
