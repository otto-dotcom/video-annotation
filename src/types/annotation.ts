export interface Annotation {
  id: string;
  timestamp: number;
  x: number;
  y: number;
  frame: string;
  comment: string;
  createdAt: string;
}

export interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
}

export interface RenderedVideoRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NormalizedCoordinates {
  x: number;
  y: number;
}