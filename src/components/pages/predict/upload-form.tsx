import Dropzone from "@/components/ui/dropzone";
import { cn } from "@/lib/utils";
import { fontKhand } from "@/themes/font";

type UploadFormProps = {
  onDrop: (files: File[]) => void;
};

export default function UploadForm({ onDrop }: UploadFormProps) {
  return (
    <div className="flex flex-col max-w-xl items-center">
      <h1
        className={cn(
          "text-6xl text-black font-bold mb-4",
          fontKhand.className
        )}
      >
        Detect Air Gap in concrete
      </h1>
      <p className="text-lg font-normal text-black mb-8">
        Detect Air Gap in concrete with the easiest detection platform
      </p>
      <div className="w-full h-24">
        <Dropzone
          classNameWrapper="w-full h-full"
          dropMessage="Drop your image here or click to upload"
          name="files"
          onDrop={onDrop}
          accept={{ "image/jpg": [], "image/jpeg": [], "image/png": [] }}
        />
      </div>
    </div>
  );
}
