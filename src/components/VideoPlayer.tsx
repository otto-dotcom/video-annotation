'use client';

import { useRef, useEffect, useState, MouseEvent, ChangeEvent } from 'react';
import { useVideo } from '@/hooks/useVideo';
import { getRenderedVideoRect, getNormalizedCoordinates, formatTime } from '@/lib/coordinates';
import { NormalizedCoordinates } from '@/types/annotation';

const MARKER_COLORS = [
  '#FF4757', '#00D4AA', '#FFA502', '#747D8C', '#5352ED',
  '#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181',
];

interface VideoPlayerProps {
  annotations: Array<{ 
    id: string; 
    index: number;
    x: number; 
    y: number; 
    timestamp: number; 
    color: string;
  }>;
  commentMode?: boolean;
  selectedIndex?: number | null;
  onAnnotationClick?: (coords: NormalizedCoordinates, timestamp: number, frame: string, index: number) => void;
  onSelectAnnotation?: (index: number) => void;
  videoRect?: { x: number; y: number; width: number; height: number } | null;
  onToggleCommentMode?: () => void;
  commentModeActive?: boolean;
}

export function VideoPlayer({
  annotations = [],
  commentMode = false,
  selectedIndex = null,
  onAnnotationClick,
  onSelectAnnotation,
  videoRect,
  onToggleCommentMode,
  commentModeActive = false,
}: VideoPlayerProps) {
  const {
    videoRef,
    videoSrc,
    duration,
    currentTime,
    isPlaying,
    videoMetadata,
    loadVideo,
    togglePlay,
    seek,
    captureFrame,
    handleLoadedMetadata,
    handleTimeUpdate,
    handlePlay,
    handlePause,
  } = useVideo();

  const containerRef = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [renderedRect, setRenderedRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [hoverCoords, setHoverCoords] = useState<NormalizedCoordinates | null>(null);

  useEffect(() => {
    const updateRect = () => {
      const video = videoRef.current;
      const container = containerRef.current;
      if (video && container) {
        const containerRect = container.getBoundingClientRect();
        const rect = getRenderedVideoRect(video, containerRect);
        setRenderedRect(rect);
      }
    };

    const video = videoRef.current;
    if (video) {
      updateRect();
      video.addEventListener('loadedmetadata', updateRect);
      video.addEventListener('resize', updateRect);
    }
    window.addEventListener('resize', updateRect);
    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', updateRect);
        video.removeEventListener('resize', updateRect);
      }
      window.removeEventListener('resize', updateRect);
    };
  }, []);

  const handleContainerClick = (e: MouseEvent<HTMLDivElement> | MouseEvent<HTMLVideoElement>) => {
    if (!commentMode || !onAnnotationClick || !videoRef.current) return;

    const container = containerRef.current;
    if (!container || !renderedRect) return;

    const containerRect = container.getBoundingClientRect();
    const coords = getNormalizedCoordinates(e.clientX, e.clientY, renderedRect, containerRect);
    
    if (coords) {
      const frame = captureFrame();
      if (frame) {
        const newIndex = annotations.length;
        onAnnotationClick(coords, videoRef.current.currentTime, frame, newIndex);
      }
    }
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!renderedRect || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const coords = getNormalizedCoordinates(e.clientX, e.clientY, renderedRect, containerRect);
    setHoverCoords(coords);
  };

  const handleSeek = (e: ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    seek(time);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadVideo(file);
    }
  };

  if (!videoSrc) {
    return (
      <div className="video-player-container" ref={containerRef}>
        <div className="video-upload-area" onClick={() => fileInput.current?.click()}>
          <input
            ref={fileInput}
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <p>Click or drag to upload a video file</p>
          <p className="hint">Supports MP4, WebM, MOV, and other HTML5 video formats</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-player-container" ref={containerRef} onMouseMove={handleMouseMove}>
      <div className="video-top-bar">
        <span className="video-title">Video Player</span>
        <button
          className={`comment-toggle-btn ${commentModeActive ? 'active' : ''}`}
          onClick={onToggleCommentMode}
          disabled={!videoSrc}
          title={commentModeActive ? 'Cancel comment mode' : 'Add comment'}
        >
          <span className="btn-icon">💬</span>
          <span className="btn-text">{commentModeActive ? 'Cancel Comment' : 'Add Comment'}</span>
        </button>
      </div>
      <div className="video-area">
        <div 
          className="video-wrapper"
          style={{ cursor: commentMode ? 'crosshair' : 'default' }}
          onClick={handleContainerClick}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={handlePlay}
            onPause={handlePause}
            playsInline
            className="video-element"
            style={{ pointerEvents: commentMode ? 'none' : 'auto' }}
            onClick={commentMode ? handleContainerClick : undefined}
          />
          {commentMode && renderedRect && (
            <div
              className="click-indicator"
              style={{
                left: `${renderedRect.x}px`,
                top: `${renderedRect.y}px`,
                width: `${renderedRect.width}px`,
                height: `${renderedRect.height}px`,
              }}
            />
          )}
          {annotations.map((annotation) => (
            renderedRect && (
              <div
                key={annotation.id}
                className={`numbered-marker ${selectedIndex === annotation.index ? 'selected' : ''}`}
                style={{
                  left: `${renderedRect.x + annotation.x * renderedRect.width - 14}px`,
                  top: `${renderedRect.y + annotation.y * renderedRect.height - 14}px`,
                  '--marker-color': annotation.color,
                } as React.CSSProperties}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectAnnotation?.(annotation.index);
                  seek(annotation.timestamp);
                }}
                title={`${formatTime(annotation.timestamp)} - Click to seek`}
              >
                <span className="marker-number">{annotation.index + 1}</span>
              </div>
            )
          ))}
        </div>
      </div>

      <div className="video-controls">
        <button onClick={togglePlay} className="control-btn">
          {isPlaying ? '⏸' : '▶'}
        </button>
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="seek-bar"
        />
        <span className="time-display">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        {videoMetadata && (
          <span className="video-info">
            {videoMetadata.width}×{videoMetadata.height}
          </span>
        )}
      </div>

      {renderedRect && (
        <div className="debug-coords">
          Hover: {hoverCoords ? `X: ${(hoverCoords.x * 100).toFixed(1)}% Y: ${(hoverCoords.y * 100).toFixed(1)}%` : 'Outside video'}
          | Rendered: ${renderedRect.width.toFixed(0)}×${renderedRect.height.toFixed(0)}
          | Video: ${videoMetadata?.width || 0}×${videoMetadata?.height || 0}
        </div>
      )}
    </div>
  );
}