export interface BBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
  class: string;
  confidence: number;
}

export interface Result {
  airgap_detected: boolean;
  classification_confidence: number;
  bboxes?: BBox[];
}

export interface SuccessfulItem {
  id: string;
  result: Result;
}

export interface FailedItem {
  id: string;
  reason: string;
}

export interface ImageDetectionResponse {
  successful: SuccessfulItem[];
  failed: FailedItem[];
}
