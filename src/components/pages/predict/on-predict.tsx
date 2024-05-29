import { PredictState } from "@/app/predict/page";
import DotAnimation from "@/components/ui/dot-animation";
import { Progress } from "@/components/ui/progress";

interface OnPredictProps {
  state: PredictState;
  uploadProgress: number;
  totalDetection: number;
  detectionProgress: number;
  imageProcessingProgress: number;
}

export default function OnPredict({
  state,
  uploadProgress,
  detectionProgress,
  totalDetection,
  imageProcessingProgress,
}: OnPredictProps) {
  const progressText = () => {
    switch (state) {
      case "Uploading":
        return "Uploading";
      case "OnQueue":
        return "On Queue";
      case "OnDetection":
        return `Detecting Image ${detectionProgress} of ${totalDetection}`;
      case "OnImageProcessing":
        return `Image Processing ${Math.round(imageProcessingProgress)}%`;
      case "ProcessingDone":
        return "Done";
      case "Error":
        return "Error";
    }
  };

  const progressValue = () => {
    switch (state) {
      case "Uploading":
        return uploadProgress;
      case "OnQueue":
        return 100;
      case "OnDetection":
        return (detectionProgress / totalDetection) * 100;
      case "OnImageProcessing":
        return imageProcessingProgress;
      case "ProcessingDone":
        return 100;
      case "Error":
        return 0;
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="flex flex-row items-center justify-center space-x-2">
        <h1 className="text-2xl font-bold text-black mb-4">{progressText()}</h1>
        {state !== "ProcessingDone" && <DotAnimation />}
      </div>
      <div className="max-w-xl w-full">
        <Progress value={progressValue()} />
      </div>
    </div>
  );
}
