"use client";
import Logo from "@/components/Logo";
import UploadForm from "@/components/pages/predict/upload-form";
import UploadView from "@/components/pages/predict/upload-view";
import { useCallback, useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import axios, { AxiosError } from "axios";
import OnPredict from "@/components/pages/predict/on-predict";
import { ImageDetectionResponse } from "@/interfaces/image-detection-response";
import { PredictionResultResponse } from "@/interfaces/prediction-result-response";
import ResultView from "@/components/pages/predict/result-view";
import JSZip from "jszip";

export interface FileWithMeta {
  file: File;
  id: string;
  url: string;
  airgap?: boolean;
  confidence?: number;
  error?: string;
}

export interface PredictData {
  files: FileWithMeta[];
  detectionMethod?: "cnn" | "roboflow";
}

export type PredictState =
  | "Idle"
  | "Uploading"
  | "OnQueue"
  | "OnDetection"
  | "OnImageProcessing"
  | "ProcessingDone"
  | "Error"
  | "PredictDone";

export default function Predict() {
  const [isOnPredict, setIsOnPredict] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [detectionProgress, setDetectionProgress] = useState(0);
  const [imageProcessingProgress, setImageProcessingProgress] = useState(0);
  const [predictState, setPredictState] = useState<PredictState>("Idle");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const predictForm = useForm<PredictData>({
    defaultValues: {
      files: [],
    },
  });

  const { setValue } = predictForm;
  const filesWithMeta = useWatch({
    control: predictForm.control,
    name: "files",
  });
  const detectionMethod = useWatch({
    control: predictForm.control,
    name: "detectionMethod",
  });

  const { toast } = useToast();

  const addImageFile = useCallback(
    (droppedFiles: File[]) => {
      const newFilesWithMeta: FileWithMeta[] = [...filesWithMeta];

      droppedFiles.forEach((file) => {
        if (
          !newFilesWithMeta.some(
            (fwm) =>
              fwm.file.name === file.name &&
              fwm.file.size === file.size &&
              fwm.file.type === file.type
          )
        ) {
          const fileMeta = {
            file: file,
            id: uuidv4(),
            url: URL.createObjectURL(file),
          };
          newFilesWithMeta.push(fileMeta);
        }
      });

      setValue("files", newFilesWithMeta, { shouldValidate: true });
    },
    [setValue, filesWithMeta]
  );

  const onClickPredict = async () => {
    if (!detectionMethod) {
      return toast({
        title: "Select detection method",
        description: "Please select a detection method to proceed",
        variant: "destructive",
      });
    }

    if (filesWithMeta.length === 0) {
      return toast({
        title: "No image selected",
        description: "Please select an image to proceed",
        variant: "destructive",
      });
    }

    const formData = new FormData();

    filesWithMeta.forEach((file) => {
      formData.append("files", file.file);
      formData.append("ids", file.id);
    });

    formData.append("detection_method", detectionMethod);

    setIsOnPredict(true);
    setPredictState("Uploading");

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/predict/`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total ?? 1)
            );

            setUploadProgress(percentCompleted);
          },
        }
      );

      startPrediction(response.data.jobId);
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response) {
          toast({
            title: "Error",
            description: error.response.data.detail,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: "An error occurred while processing the request",
            variant: "destructive",
          });
        }
      }
    } finally {
      setUploadProgress(0);
      setPredictState("ProcessingDone");
    }
  };

  useEffect(() => {
    predictForm.register("files");
    return () => {
      predictForm.unregister("files");
    };
  }, [predictForm]);

  const startPrediction = (jobId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get<PredictionResultResponse>(
          `${process.env.NEXT_PUBLIC_API_URL}/result/${jobId}`
        );
        switch (response.data.state) {
          case "PENDING":
            setPredictState("OnQueue");
            break;
          case "IN_PROGRESS":
            setPredictState("OnDetection");
            setDetectionProgress(response.data.current ?? 0);
            break;
          case "SUCCESS":
            setPredictState("ProcessingDone");
            startImageProcessing(response.data.result);
            clearInterval(interval);
            break;
          default:
            console.error("Unexpected state:", response.data.state);
            clearInterval(interval);
        }
      } catch (error) {
        console.error("Request failed:", error);
        clearInterval(interval);
        if (axios.isAxiosError(error)) {
          const description =
            error.response?.data.detail ||
            "An error occurred while processing the request";
          toast({
            title: "Error",
            description: description,
            variant: "destructive",
          });
        }
      }
    }, 1000);
  };

  const startImageProcessing = async (result: ImageDetectionResponse) => {
    console.log("Processing result:");
    setPredictState("OnImageProcessing");
    const successfulItems = result.successful;

    for (let i = 0; i < successfulItems.length; i++) {
      const item = successfulItems[i];
      const fileWithMeta = filesWithMeta.find((fwm) => fwm.id === item.id);

      if (!fileWithMeta) {
        console.error("File not found:", item.id);
        continue;
      }

      fileWithMeta.airgap = item.result.airgap_detected;
      fileWithMeta.confidence = item.result.classification_confidence;

      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not found");
        continue;
      }

      const image = new Image();
      image.src = fileWithMeta.url;

      await new Promise<void>((resolve) => {
        image.onload = () => {
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            console.error("Context not found");
            return resolve();
          }

          canvas.width = image.width;
          canvas.height = image.height;
          console.log("Canvas width:", canvas.width, "height:", canvas.height);
          ctx.drawImage(image, 0, 0);

          item.result.bboxes?.forEach((bbox) => {
            console.log("Drawing bbox:", bbox);
            // Skip if not airgap
            if (bbox.class !== "airgap") {
              return;
            }

            ctx.beginPath();
            ctx.rect(
              bbox.xmin,
              bbox.ymin,
              bbox.xmax - bbox.xmin,
              bbox.ymax - bbox.ymin
            );
            ctx.lineWidth = 4;
            ctx.strokeStyle = "red";
            ctx.stroke();

            ctx.fillStyle = "red";
            ctx.font = "32px Arial";
            ctx.fillText(
              `(${Math.round(bbox.confidence * 100)}%)`,
              bbox.xmin,
              bbox.ymin - 10
            );
          });

          const newUrl = canvas.toDataURL("image/jpeg");
          console.log("New URL:", newUrl);
          fileWithMeta.url = newUrl;
          setValue("files", filesWithMeta, { shouldValidate: true });

          resolve();
        };
      });

      setImageProcessingProgress(((i + 1) / successfulItems.length) * 100);
    }

    for (let i = 0; i < result.failed.length; i++) {
      const failedItem = result.failed[i];
      const fileWithMeta = filesWithMeta.find(
        (fwm) => fwm.id === failedItem.id
      );

      if (!fileWithMeta) {
        console.error("File not found:", failedItem.id);
        continue;
      }

      fileWithMeta.error = failedItem.reason;
    }

    setPredictState("PredictDone");
  };

  const resetPredict = () => {
    setIsOnPredict(false);
    setPredictState("Idle");
    setUploadProgress(0);
    setDetectionProgress(0);
    setImageProcessingProgress(0);
    setValue("files", []);
  };

  const downloadAsZip = async () => {
    const zip = new JSZip();
    filesWithMeta.forEach((file) => {
      if (file.airgap) {
        zip.file(
          "airgap_detection/" + file.file.name,
          file.url.replace(/^data:image\/(png|jpeg);base64,/, ""),
          {
            base64: true,
          }
        );
      } else {
        zip.file(
          "no_airgap/" + file.file.name,
          file.url.replace(/^data:image\/(png|jpeg);base64,/, ""),
          {
            base64: true,
          }
        );
      }
    });

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = `airgap_detection_${new Date().toISOString()}.zip`;
    a.click();
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <header className="top-0 left-0 p-5 h-16 text-white flex-none self-start">
        <Logo />
      </header>
      <div className="text-center bg-white/90 w-full flex-1 flex justify-center items-center">
        <FormProvider {...predictForm}>
          {filesWithMeta.length === 0 && <UploadForm onDrop={addImageFile} />}{" "}
          {filesWithMeta.length > 0 && !isOnPredict && (
            <UploadView
              addImageFile={addImageFile}
              onClickPredict={onClickPredict}
              disabled={isOnPredict}
            />
          )}
          {isOnPredict && predictState !== "PredictDone" && (
            <OnPredict
              uploadProgress={uploadProgress}
              state={predictState}
              detectionProgress={detectionProgress}
              imageProcessingProgress={imageProcessingProgress}
              totalDetection={filesWithMeta.length}
            />
          )}
          {isOnPredict && predictState === "PredictDone" && (
            <ResultView
              onClickReset={resetPredict}
              onClickDownload={downloadAsZip}
            />
          )}
        </FormProvider>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
