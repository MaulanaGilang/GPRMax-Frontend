import { FileWithMeta, PredictData } from "@/app/predict/page";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { fontKhand, fontManrope } from "@/themes/font";
import Image from "next/image";
import { useState } from "react";
import { useFormContext } from "react-hook-form";

interface ResultViewProps {
  onClickDownload: () => void;
  onClickReset: () => void;
}

export default function ResultView({
  onClickDownload,
  onClickReset,
}: ResultViewProps) {
  const result = useFormContext<PredictData>();
  const [openPreview, setOpenPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileWithMeta | null>(null);

  const files = result.watch("files");

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
                <div
                  className={cn(
                    "absolute top-0 left-0 w-full h-full opacity-30 rounded-lg",
                    file.airgap && "bg-green-400",
                    !file.airgap && "bg-red-400"
                  )}
                />
                <div className="absolute top-0 left-0 w-full h-full opacity-0 bg-black hover:opacity-30 transition-opacity rounded-lg" />
                <div className="absolute bottom-2 left-0 w-full h-12  flex items-center justify-center">
                  <p className="text-white font-bold p-2 bg-black/50 rounded-lg">
                    {file.airgap ? "Air Gap" : "No Air Gap"}
                    {file.confidence &&
                      ` - ${(file.confidence * 100).toFixed(1)}%`}
                  </p>
                </div>
                <Image
                  src={file.url}
                  alt="result image"
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
              "text-4xl text-black font-bold mt-6",
              fontKhand.className
            )}
          >
            Result
          </h1>
          <h2 className={cn("text-5xl text-black font-bold mt-8", fontKhand)}>
            {Math.round(
              (files.filter((file) => file.airgap).length / files.length) * 100
            )}
            %
          </h2>
          <p
            className={cn(
              "text-lg font-semibold text-black mt-2 mb-4",
              fontManrope
            )}
          >
            Airgap detected in {files.filter((file) => file.airgap).length} out
            of {files.length} images
          </p>
          <p>
            Scroll down to see the results of each image. Click on the image to
            see a larger preview.
          </p>
          <div className="flex flex-1 w-full justify-center items-end">
            <div className="flex flex-wrap gap-4 mb-12 w-full">
              <Button
                size="lg"
                className="bg-black text-white flex-1"
                onClick={onClickReset}
              >
                New Prediction
              </Button>
              <Button
                size="lg"
                className="bg-black text-white flex-1"
                onClick={onClickDownload}
              >
                Download ZIP
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
