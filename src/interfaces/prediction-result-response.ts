import { ImageDetectionResponse } from "./image-detection-response";

export interface PredictionResultResponse {
  state: "SUCCESS" | "PENDING" | "IN_PROGRESS" | "SUCCESS";
  total: number;
  current: number | null;
  current_id: string | null;
  result: ImageDetectionResponse;
}
