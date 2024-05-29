import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import React, { useRef } from "react";
import { Accept, DropEvent, FileRejection, useDropzone } from "react-dropzone";

interface DropzoneProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "accept" | "onDrop"
  > {
  name: string;
  accept?: Accept;
  classNameWrapper?: string;
  className?: string;
  dropMessage: string;
  onDrop?: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void;
}

const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  function Dropzone(
    {
      name,
      className,
      classNameWrapper,
      dropMessage,
      accept,
      onDrop,
      ...props
    },
    ref
  ) {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop,
      accept: accept,
    });

    const inputRef = useRef<HTMLInputElement | null>(null);

    return (
      <Card
        {...getRootProps()}
        ref={ref}
        className={cn(
          `border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50`,
          classNameWrapper,
          isDragActive && "cursor-pointer border-muted-foreground/50"
        )}
      >
        <CardContent className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs h-full">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <span className="font-medium text-lg text-center">
              {dropMessage}
            </span>
            <Input
              {...props}
              {...getInputProps()}
              value={undefined}
              key={name}
              ref={inputRef}
              type="file"
              className={cn("hidden", className)}
            />
          </div>
        </CardContent>
      </Card>
    );
  }
);

export default Dropzone;
