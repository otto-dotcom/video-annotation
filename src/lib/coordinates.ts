import { RenderedVideoRect, NormalizedCoordinates } from '@/types/annotation';

export function getRenderedVideoRect(
  videoElement: HTMLVideoElement,
  containerRect: DOMRect
): RenderedVideoRect {
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  if (!videoWidth || !videoHeight) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const videoAspectRatio = videoWidth / videoHeight;
  const containerWidth = containerRect.width;
  const containerHeight = containerRect.height;
  const containerAspectRatio = containerWidth / containerHeight;

  let renderedWidth: number;
  let renderedHeight: number;
  let renderedX: number;
  let renderedY: number;

  if (videoAspectRatio > containerAspectRatio) {
    renderedWidth = containerWidth;
    renderedHeight = containerWidth / videoAspectRatio;
    renderedX = 0;
    renderedY = (containerHeight - renderedHeight) / 2;
  } else {
    renderedHeight = containerHeight;
    renderedWidth = containerHeight * videoAspectRatio;
    renderedY = 0;
    renderedX = (containerWidth - renderedWidth) / 2;
  }

  return {
    x: renderedX,
    y: renderedY,
    width: renderedWidth,
    height: renderedHeight,
  };
}

export function getNormalizedCoordinates(
  clickX: number,
  clickY: number,
  videoRect: RenderedVideoRect,
  containerRect: DOMRect
): NormalizedCoordinates | null {
  const relativeX = clickX - containerRect.left;
  const relativeY = clickY - containerRect.top;

  const videoX = relativeX - videoRect.x;
  const videoY = relativeY - videoRect.y;

  if (videoX < 0 || videoY < 0 || videoX > videoRect.width || videoY > videoRect.height) {
    return null;
  }

  return {
    x: videoX / videoRect.width,
    y: videoY / videoRect.height,
  };
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = (seconds % 60).toFixed(3).padStart(6, '0');
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${secs}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}